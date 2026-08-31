import { Link } from 'react-router-dom'
import { aiBotPackages } from '../data/aiBotPackages'
import DemoChat from '../components/aibot/DemoChat'
import './AIBot.css'

function AIBot() {
  return (
    <div className="aibot-page">
      <section className="aibot-hero">
        <div className="aibot-hero-text">
          <span className="aibot-eyebrow">AI Chatbots</span>
          <h1 className="aibot-hero-title">
            AI Bots That Talk to Your Customers <span className="aibot-highlight">24/7</span>
          </h1>
          <p className="aibot-hero-subtitle">
            Try our live demo below — this is a real, working chatbot. Your custom bot will be trained specifically on your business.
          </p>
          <Link to="/contact" className="aibot-hero-btn btn-neon-primary">
            Get Your Custom Bot
          </Link>
        </div>

        <div className="aibot-hero-demo">
          <DemoChat />
        </div>
      </section>

      <section className="aibot-packages">
        <h2 className="aibot-section-title">Choose Your Package</h2>

        <div className="aibot-packages-grid">
          {aiBotPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`aibot-card ${pkg.highlighted ? 'highlighted' : ''}`}
            >
              {pkg.badge && <span className="aibot-badge">{pkg.badge}</span>}

              <h3 className="aibot-card-name">{pkg.name}</h3>
              <p className="aibot-card-description">{pkg.description}</p>

              <div className="aibot-card-price">
                <span className="aibot-price-bdt">{pkg.priceBDT}</span>
                <span className="aibot-price-usd">{pkg.priceUSD}</span>
              </div>

              <span className="aibot-delivery">⏱ {pkg.delivery}</span>

              <ul className="aibot-features">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="feature-yes">
                    <span>✓</span> {feature}
                  </li>
                ))}
                {pkg.notIncluded.map((feature, index) => (
                  <li key={index} className="feature-no">
                    <span>✕</span> {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/contact"
                className={pkg.highlighted ? 'aibot-btn-primary btn-neon-primary' : 'aibot-btn-secondary btn-neon-secondary'}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="aibot-reseller">
        <div className="aibot-reseller-container">
          <h2>Are You an Agency or Reseller?</h2>
          <p>
            Enterprise package includes white-label rights — deploy AI bots for your clients under your own brand.
          </p>
          <Link to="/contact" className="aibot-reseller-btn btn-neon-primary">
            Ask About Reseller Pricing
          </Link>
        </div>
      </section>
    </div>
  )
}

export default AIBot