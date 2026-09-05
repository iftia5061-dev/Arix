import { Link } from 'react-router-dom'
import { pricingPlans } from '../data/pricing'
import './Pricing.css'

function PricingCard({ plan }) {
  return (
    <div
      className={`pricing-card glass-panel ${plan.highlighted ? 'highlighted glow-active' : ''}`}
    >
      {plan.highlighted && <span className="pricing-badge">Most Popular</span>}

      <h3 className="pricing-plan-name">{plan.name}</h3>
      <p className="pricing-plan-description">{plan.description}</p>

      <div className="pricing-plan-price">
        <span className="price-amount">{plan.price}</span>
        <span className="price-period">{plan.period}</span>
      </div>

      <ul className="pricing-features">
        {plan.features.map((feature, index) => (
          <li key={index}>
            <span className="pricing-check">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        to="/contact"
        className="pricing-btn-new"
        aria-label="Get Started - Choose pricing plan"
      >
        Get Started
      </Link>
    </div>
  )
}

function Pricing() {
  return (
    <div className="pricing-page">
      <section className="pricing-hero">
        <h1 className="pricing-hero-title">Simple, Transparent Pricing</h1>
        <p className="pricing-hero-subtitle">
          Choose the plan that fits your business. No hidden fees, cancel anytime.
        </p>
      </section>

      <section className="pricing-plans">
        <div className="pricing-plans-grid">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="pricing-faq-note">
        <p>Have questions about our pricing? <Link to="/contact">Order Now</Link> and we'll help you find the right plan.</p>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="mobile-sticky-cta pricing-mobile-cta">
        <div className="mobile-sticky-cta-content">
          <span className="mobile-sticky-cta-info">Choose your pricing plan</span>
          <Link to="/contact" className="mobile-sticky-cta-btn">Get Started</Link>
        </div>
      </div>
    </div>
  )
}

export default Pricing