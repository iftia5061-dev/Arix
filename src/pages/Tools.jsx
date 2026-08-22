import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toolsCategories } from '../data/toolsPackages'
import './Tools.css'

function Tools() {
  const [activeTab, setActiveTab] = useState(toolsCategories[0].id)
  const activeCategory = toolsCategories.find((cat) => cat.id === activeTab)

  return (
    <div className="tools-page">
      <section className="tools-hero">
        <h1 className="tools-hero-title">Business Tools</h1>
        <p className="tools-hero-subtitle">
          Ready-to-use software tools to run your business smarter — subscribe monthly, cancel anytime.
        </p>
      </section>

      <section className="tools-tabs">
        <div className="tools-tabs-nav">
          {toolsCategories.map((cat) => (
            <button
              key={cat.id}
              className={`tools-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        <p className="tools-tab-description">{activeCategory.description}</p>

        <div className="tools-packages-grid">
          {activeCategory.packages.map((pkg, index) => (
            <div
              key={index}
              className={`tools-card ${pkg.highlighted ? 'highlighted' : ''}`}
            >
              {pkg.highlighted && <span className="tools-badge">Most Popular</span>}

              <h3 className="tools-card-name">{pkg.name}</h3>

              <div className="tools-card-price">
                <span className="tools-price-bdt">{pkg.priceBDT}</span>
                <span className="tools-price-period">{pkg.period}</span>
              </div>
              <span className="tools-price-usd">{pkg.priceUSD}{pkg.period}</span>

              <ul className="tools-features">
                {pkg.features.map((feature, i) => (
                  <li key={i}>
                    <span>✓</span> {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/contact"
                className={pkg.highlighted ? 'tools-btn-primary' : 'tools-btn-secondary'}
              >
                Subscribe
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="tools-reseller">
        <div className="tools-reseller-container">
          <h2>Are You an Agency or Reseller?</h2>
          <p>
            Enterprise tier includes white-label rights — offer these tools to your own clients under your own brand.
          </p>
          <Link to="/contact" className="tools-reseller-btn">
            Ask About Reseller Pricing
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Tools