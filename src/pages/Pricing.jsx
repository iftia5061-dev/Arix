import { Link } from 'react-router-dom'
import { pricingPlans } from '../data/pricing'
import './Pricing.css'

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
            <div
              key={plan.id}
              className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
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
                className={plan.highlighted ? 'pricing-btn-primary' : 'pricing-btn-secondary'}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="pricing-faq-note">
        <p>Have questions about our pricing? <Link to="/contact">Contact us</Link> and we'll help you find the right plan.</p>
      </section>
    </div>
  )
}

export default Pricing