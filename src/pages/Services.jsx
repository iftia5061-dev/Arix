import { Link, useParams } from 'react-router-dom'
import { services } from '../data/services'
import './Services.css'

function ServiceDetails({ service }) {
  return (
    <main className="services-page service-details-page">
      <section className="service-details-hero">
        <Link to="/services" className="service-details-back">← All services</Link>
        <span className="service-details-icon" aria-hidden="true">{service.icon}</span>
        <h1>{service.name}</h1>
        <p>{service.description}</p>
        <Link to="/contact" className="services-cta-btn btn-neon-primary">Get a Quote</Link>
      </section>
      <section className="service-details-content">
        <h2>How Orofex can help</h2>
        <p>We plan, design, build, and support a solution around your business goals, users, and workflow.</p>
        <Link to="/contact" className="service-list-link">Discuss your project →</Link>
      </section>
    </main>
  )
}

function Services() {
  const { slug } = useParams()
  const selectedService = slug ? services.find((service) => service.slug === slug) : null

  if (slug && !selectedService) return <main className="services-page service-details-page"><section className="service-details-hero"><h1>Service not found</h1><p>This service is not currently available.</p><Link to="/services" className="services-cta-btn btn-neon-primary">View all services</Link></section></main>
  if (selectedService) return <ServiceDetails service={selectedService} />

  return (
    <main className="services-page">
      <section className="services-hero">
        <h1 className="services-hero-title">Our Services</h1>
        <p className="services-hero-subtitle">From custom software to AI-driven automation, Orofex delivers end-to-end digital solutions tailored to your business.</p>
      </section>

      <section className="services-list">
        <div className="services-list-grid">
          {services.map((service) => (
            <article className="service-list-card" key={service.id}>
              <div className="service-list-icon">{service.icon}</div>
              <h2 className="service-list-name">{service.name}</h2>
              <p className="service-list-description">{service.description}</p>
              <Link to={`/services/${service.slug}`} className="service-list-link">Learn more →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="services-cta">
        <h2>Have a project in mind?</h2>
        <p>Let&apos;s discuss how Orofex can bring your idea to life.</p>
        <Link to="/contact" className="services-cta-btn btn-neon-primary">Start a Project</Link>
      </section>
    </main>
  )
}

export default Services
