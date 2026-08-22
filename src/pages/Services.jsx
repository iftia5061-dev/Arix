import { Link } from 'react-router-dom'
import { services } from '../data/services'
import './Services.css'

function Services() {
  return (
    <div className="services-page">
      <section className="services-hero">
        <h1 className="services-hero-title">Our Services</h1>
        <p className="services-hero-subtitle">
          From custom software to AI-driven automation, ARIX delivers end-to-end digital solutions tailored to your business.
        </p>
      </section>

      <section className="services-list">
        <div className="services-list-grid">
          {services.map((service) => (
            <div className="service-list-card" key={service.id}>
              <div className="service-list-icon">{service.icon}</div>
              <h3 className="service-list-name">{service.name}</h3>
              <p className="service-list-description">{service.description}</p>
              <Link to="/contact" className="service-list-link">
                Get a Quote →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="services-cta">
        <h2>Have a project in mind?</h2>
        <p>Let's discuss how ARIX can bring your idea to life.</p>
        <Link to="/contact" className="services-cta-btn">
          Start a Project
        </Link>
      </section>
    </div>
  )
}

export default Services