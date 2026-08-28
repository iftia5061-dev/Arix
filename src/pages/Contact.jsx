import { useState, useRef } from 'react'
import emailjs from '@emailjs/browser'
import './Contact.css'

const SERVICE_ID = 'service_6d3j3eg'
const TEMPLATE_ID = 'template_ooy5351'
const PUBLIC_KEY = 'SKa-nGZ4RnuGbNj3D'

function Contact() {
  const formRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('sending')

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
      .then(() => {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
      })
      .catch((error) => {
        console.error('EmailJS error:', error)
        setStatus('error')
      })
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1 className="contact-hero-title">Get in Touch</h1>
        <p className="contact-hero-subtitle">
          Have a project in mind or a question? We'd love to hear from you.
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-content-grid">
          <div className="contact-info">
            <h2>Contact Information</h2>

            <div className="contact-info-item">
              <span className="contact-info-icon">📧</span>
              <div>
                <h4>Email</h4>
                <p>ceo.Orofex.info@gmail.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-info-icon">📞</span>
              <div>
                <h4>Phone</h4>
                <p>+880 1XXX-XXXXXX</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-info-icon">📍</span>
              <div>
                <h4>Location</h4>
                <p>Dhaka, Bangladesh</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-info-icon">⏰</span>
              <div>
                <h4>Working Hours</h4>
                <p>Sun – Thu, 9AM – 6PM</p>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            {status === 'success' && (
              <div className="contact-success">
                ✓ Your message has been sent! We'll get back to you soon.
              </div>
            )}

            {status === 'error' && (
              <div className="contact-error">
                ✕ Something went wrong. Please try again or email us directly.
              </div>
            )}

            <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="from_name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="from_email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="contact-submit-btn" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact