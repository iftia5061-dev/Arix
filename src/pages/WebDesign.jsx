import { Link } from 'react-router-dom'
import { webDesignPackages } from '../data/webDesignPackages'
import './WebDesign.css'

function WebDesign() {
  return (
    <div className="webdesign-page">
      <section className="webdesign-hero">
        <span className="webdesign-eyebrow">Web Design Services</span>
        <h1 className="webdesign-hero-title">
          Websites That Look Premium & <span className="webdesign-highlight">Actually Convert</span>
        </h1>
        <p className="webdesign-hero-subtitle">
          From simple business sites to fully custom, animated platforms — we design and build websites that make your brand look serious.
        </p>
      </section>

      <section className="webdesign-proof">
        <div className="webdesign-proof-card">
          <span className="webdesign-proof-icon">✨</span>
          <div>
            <h3>This site is our portfolio piece</h3>
            <p>The website you're browsing right now — animations, design, everything — was built by Orofex. This is the quality you get.</p>
          </div>
        </div>
      </section>

      <section className="webdesign-packages">
        <h2 className="webdesign-section-title">Choose Your Package</h2>

        <div className="webdesign-packages-grid">
          {webDesignPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`webdesign-card ${pkg.highlighted ? 'highlighted' : ''}`}
            >
              {pkg.badge && <span className="webdesign-badge">{pkg.badge}</span>}

              <h3 className="webdesign-card-name">{pkg.name}</h3>
              <p className="webdesign-card-description">{pkg.description}</p>

              <div className="webdesign-card-price">
                <span className="webdesign-price-bdt">{pkg.priceBDT}</span>
                <span className="webdesign-price-usd">{pkg.priceUSD}</span>
              </div>

              <span className="webdesign-delivery">⏱ {pkg.delivery}</span>

              <ul className="webdesign-features">
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
                className={pkg.highlighted ? 'webdesign-btn-primary' : 'webdesign-btn-secondary'}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="webdesign-reseller">
        <div className="webdesign-reseller-container">
          <h2>Are You an Agency or Reseller?</h2>
          <p>
            Enterprise package includes white-label rights — buy at wholesale price, deliver under your own brand, keep the margin.
          </p>
          <Link to="/contact" className="webdesign-reseller-btn">
            Ask About Reseller Pricing
          </Link>
        </div>
      </section>
    </div>
  )
}

export default WebDesign