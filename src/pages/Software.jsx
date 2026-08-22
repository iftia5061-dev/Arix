import { useState } from 'react'
import { Link } from 'react-router-dom'
import { softwareCategories } from '../data/softwarePackages'
import './Software.css'

function Software() {
  const [activeTab, setActiveTab] = useState(softwareCategories[0].id)
  const activeCategory = softwareCategories.find((cat) => cat.id === activeTab)

  return (
    <div className="software-page">
      <section className="software-hero">
        <h1 className="software-hero-title">Software & App Development</h1>
        <p className="software-hero-subtitle">
          Desktop software, mobile apps, and SaaS platforms — built to run your business, or resell to yours.
        </p>
      </section>

      <section className="software-tabs">
        <div className="software-tabs-nav">
          {softwareCategories.map((cat) => (
            <button
              key={cat.id}
              className={`software-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        <p className="software-tab-description">{activeCategory.description}</p>

        <div className="software-packages-grid">
          {activeCategory.packages.map((pkg, index) => (
            <div
              key={index}
              className={`software-card ${pkg.highlighted ? 'highlighted' : ''}`}
            >
              {pkg.highlighted && <span className="software-badge">Most Popular</span>}

              <h3 className="software-card-name">{pkg.name}</h3>

              <div className="software-card-price">
                <span className="software-price-bdt">{pkg.priceBDT}</span>
                <span className="software-price-usd">{pkg.priceUSD}</span>
              </div>

              <span className="software-delivery">⏱ {pkg.delivery}</span>

              <ul className="software-features">
                {pkg.features.map((feature, i) => (
                  <li key={i}>
                    <span>✓</span> {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/contact"
                className={pkg.highlighted ? 'software-btn-primary' : 'software-btn-secondary'}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="software-reseller">
        <div className="software-reseller-container">
          <h2>Are You an Agency or Reseller?</h2>
          <p>
            Enterprise tier across all our software includes white-label rights — build once with us, sell under your own brand.
          </p>
          <Link to="/contact" className="software-reseller-btn">
            Ask About Reseller Pricing
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Software