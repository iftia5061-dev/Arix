import { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'
import { useSearchParams } from 'react-router-dom'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/authStore'
import { formatOrderPlanPrice } from '../data/pricingLookup'
import './Contact.css'

const SERVICE_ID = 'service_6d3j3eg'
const TEMPLATE_ID = 'template_ooy5351'
const PUBLIC_KEY = 'SKa-nGZ4RnuGbNj3D'

const CUSTOM_CATEGORIES = [
  { value: 'web-design', label: 'Web Design', icon: '🌐' },
  { value: 'ai-bot', label: 'AI Bot', icon: '🤖' },
  { value: 'software', label: 'Software / App', icon: '💻' },
  { value: 'tools', label: 'Business Tool', icon: '🛠️' },
  { value: 'other', label: 'Something Else', icon: '✨' },
]

const EMPTY_FORM_DATA = {
  name: '',
  email: '',
  category: '',
  timeline: '',
  roadmap: '',
}

function isPlanId(value) {
  return /^[a-z0-9-]{1,120}$/.test(value || '')
}

function isVerifiedPlan(plan) {
  return plan?.active === true
    && typeof plan.category === 'string'
    && typeof plan.categoryLabel === 'string'
    && typeof plan.name === 'string'
    && (plan.subService === null || typeof plan.subService === 'string')
    && (plan.subServiceLabel === null || typeof plan.subServiceLabel === 'string')
    && Number.isInteger(plan.priceAmount)
    && plan.priceAmount > 0
    && typeof plan.priceCurrency === 'string'
    && typeof plan.priceDisplay === 'string'
    && typeof plan.billingPeriod === 'string'
    && typeof plan.isStartingAt === 'boolean'
    && (plan.delivery === null || typeof plan.delivery === 'string')
}

async function loadOrderPlan(planId) {
  const snapshot = await getDoc(doc(db, 'orderPlans', planId))
  if (!snapshot.exists()) return null

  const plan = { id: snapshot.id, ...snapshot.data() }
  return isVerifiedPlan(plan) ? plan : null
}

function getCategoryLabel(category) {
  return CUSTOM_CATEGORIES.find((item) => item.value === category)?.label || 'Custom project'
}

function Contact() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const planParam = searchParams.get('plan')
  const requestedPlanId = isPlanId(planParam) ? planParam : null
  const [formData, setFormData] = useState(EMPTY_FORM_DATA)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [planState, setPlanState] = useState(planParam ? 'loading' : 'idle')
  const [planError, setPlanError] = useState('')
  const [status, setStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')
  const [emailDeliveryFailed, setEmailDeliveryFailed] = useState(false)

  useEffect(() => {
    let active = true

    if (!planParam) {
      setSelectedPlan(null)
      setPlanState('idle')
      setPlanError('')
      return undefined
    }

    if (!requestedPlanId) {
      setSelectedPlan(null)
      setPlanState('unavailable')
      setPlanError('This plan link is invalid. Please choose a package again.')
      return undefined
    }

    setSelectedPlan(null)
    setPlanState('loading')
    setPlanError('')

    loadOrderPlan(requestedPlanId)
      .then((plan) => {
        if (!active) return
        if (!plan) {
          setPlanState('unavailable')
          setPlanError('This plan is unavailable or has changed. Please choose a package again.')
          return
        }
        setSelectedPlan(plan)
        setPlanState('ready')
      })
      .catch(() => {
        if (!active) return
        setPlanState('unavailable')
        setPlanError('We could not verify this plan from the database. Please try again shortly.')
      })

    return () => {
      active = false
    }
  }, [planParam, requestedPlanId])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('saving')
    setSubmitError('')
    setEmailDeliveryFailed(false)

    try {
      if (!user) {
        throw new Error('Please sign in with Google to place an order.')
      }

      const timelineDays = Number(formData.timeline)
      if (!formData.name.trim() || !formData.email.trim() || !formData.roadmap.trim()) throw new Error('Please complete all required fields.')
      if (!Number.isInteger(timelineDays) || timelineDays < 1 || timelineDays > 3650) throw new Error('Please enter a valid delivery timeline.')

      let verifiedPlan = null
      if (selectedPlan) {
        verifiedPlan = await loadOrderPlan(selectedPlan.id)
        if (!verifiedPlan) throw new Error('The selected plan is no longer available. Please choose a package again.')
      } else if (planParam) {
        throw new Error(planError || 'We could not verify the selected plan.')
      }

      const category = verifiedPlan?.category || formData.category
      if (!category) throw new Error('Please select what you want to build.')

      const order = {
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        category,
        categoryLabel: verifiedPlan?.categoryLabel || getCategoryLabel(category),
        planId: verifiedPlan?.id || null,
        planName: verifiedPlan?.name || null,
        subService: verifiedPlan?.subService || null,
        subServiceLabel: verifiedPlan?.subServiceLabel || null,
        priceAmount: verifiedPlan?.priceAmount || null,
        priceCurrency: verifiedPlan?.priceCurrency || null,
        priceDisplay: verifiedPlan?.priceDisplay || null,
        billingPeriod: verifiedPlan?.billingPeriod || null,
        isStartingAt: verifiedPlan?.isStartingAt || false,
        delivery: verifiedPlan?.delivery || null,
        timelineDays,
        roadmap: formData.roadmap.trim(),
        status: 'pending',
        source: 'website',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const orderRef = await addDoc(collection(db, 'orders'), order)

      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
          from_name: order.customerName,
          from_email: order.customerEmail,
          subject: order.planName ? `New order: ${order.planName}` : 'New custom order request',
          message: order.roadmap || 'No description provided',
          description: order.roadmap || 'No description provided',
          project_details: order.roadmap || 'No description provided',
          order_id: orderRef.id,
          category: order.categoryLabel,
          plan_name: order.planName || 'Custom quote',
          plan_price: formatOrderPlanPrice(order),
          delivery: order.delivery || 'To be discussed',
          timeline: `${order.timelineDays} days`,
        }, PUBLIC_KEY)
      } catch {
        setEmailDeliveryFailed(true)
      }

      setFormData(EMPTY_FORM_DATA)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setSubmitError(error.message || 'We could not save your order. Please try again.')
    }
  }

  const formDisabled = status === 'saving' || planState === 'loading' || planState === 'unavailable'

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1 className="contact-hero-title">Request a Custom Build</h1>
        <p className="contact-hero-subtitle">
          Tell us what you want to build, choose a plan when available, and we&apos;ll get back to you with a clear next step.
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-form-wrapper contact-form-wrapper-full">
          {status === 'success' && (
            <div className="contact-success" role="status">
              ✓ Your order has been received and is now pending review.{emailDeliveryFailed && ' We could not send the email confirmation, but your order was saved successfully.'}
            </div>
          )}

          {status === 'error' && <div className="contact-error" role="alert">✕ {submitError}</div>}

          <form className="contact-form" onSubmit={handleSubmit} id="contact-form">
            {planState === 'loading' && <div className="order-plan-state">Checking your selected plan…</div>}
            {planState === 'unavailable' && <div className="contact-error order-plan-state" role="alert">✕ {planError}</div>}

            {selectedPlan && (
              <section className="order-selected-plan" aria-label="Selected plan">
                <span className="order-selected-plan-label">Selected plan · verified from current database price</span>
                <div className="order-selected-plan-details">
                  <div>
                    <strong>{selectedPlan.categoryLabel}{selectedPlan.subServiceLabel ? ` · ${selectedPlan.subServiceLabel}` : ''}</strong>
                    <span>{selectedPlan.name}</span>
                  </div>
                  <div>
                    <strong>{formatOrderPlanPrice(selectedPlan)}</strong>
                    {selectedPlan.delivery && <span>{selectedPlan.delivery}</span>}
                  </div>
                </div>
              </section>
            )}

            {!planParam && (
              <div className="form-group">
                <label>What do you want built?</label>
                <div className="order-option-grid">
                  {CUSTOM_CATEGORIES.map((category) => (
                    <label key={category.value} className={`order-option-card ${formData.category === category.value ? 'selected' : ''}`}>
                      <input type="radio" name="category" value={category.value} checked={formData.category === category.value} onChange={handleChange} required />
                      <span className="order-option-icon">{category.icon}</span>
                      <span className="order-option-label">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="timeline">How many days do you need this in?</label>
              <input type="number" id="timeline" name="timeline" className="neumorphic-input" value={formData.timeline} onChange={handleChange} placeholder="e.g. 14" min="1" max="3650" step="1" required />
              <p className="order-timeline-hint">⚡ Shorter timelines can require a rush quote. Standard delivery is more affordable.</p>
            </div>

            <div className="form-group">
              <label htmlFor="roadmap">Describe exactly what you want</label>
              <textarea id="roadmap" name="roadmap" className="neumorphic-input" value={formData.roadmap} onChange={handleChange} placeholder="Describe your idea, required features, design preferences, examples or references, and anything else we should know..." rows="8" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" className="neumorphic-input" value={formData.name} onChange={handleChange} placeholder="Your name" maxLength="120" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" className="neumorphic-input" value={formData.email} onChange={handleChange} placeholder="you@example.com" maxLength="254" required />
              </div>
            </div>

            <button type="submit" className="contact-submit-btn" disabled={formDisabled} aria-label="Order Now - Submit custom service request">
              {status === 'saving' ? 'Saving order...' : 'Order Now'}
            </button>
          </form>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="mobile-sticky-cta contact-mobile-cta">
        <button type="submit" className="mobile-sticky-cta-btn" disabled={formDisabled} form="contact-form">
          {status === 'saving' ? 'Saving...' : 'Order Now'}
        </button>
      </div>
    </div>
  )
}

export default Contact
