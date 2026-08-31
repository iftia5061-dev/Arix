import { Link } from 'react-router-dom'
import { services } from '../../data/services'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import useTilt from '../../hooks/useTilt'
import './ServicesPreview.css'

function ServiceCard({ service }) {
  const tiltRef = useTilt(6)

  return (
    <Link
      ref={tiltRef}
      to={`/services/${service.slug}`}
      className="service-card glass-panel glow-hover"
    >
      <div className="service-icon">{service.icon}</div>
      <h3 className="service-name">{service.name}</h3>
      <p className="service-description">{service.description}</p>
    </Link>
  )
}

function ServicesPreview() {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section className="services-preview">
      <div className="services-preview-container">
        <div className="services-preview-header">
          <h2>Our Services</h2>
          <Link to="/services" className="view-all-link">
            View All →
          </Link>
        </div>

        <div ref={ref} className={`services-preview-grid reveal ${isVisible ? 'visible' : ''}`}>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesPreview