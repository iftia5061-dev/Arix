import { Link } from 'react-router-dom'
import { services } from '../../data/services'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import useTilt from '../../hooks/useTilt'
import useSpotlight from '../../hooks/useSpotlight'
import useSectionParallax from '../../hooks/useSectionParallax'
import { mergeRefs } from '../../utils/mergeRefs'
import './ServicesPreview.css'

function ServiceCard({ service }) {
  const tiltRef = useTilt(6)
  const spotlightRef = useSpotlight()

  return (
    <Link
      ref={mergeRefs(tiltRef, spotlightRef)}
      to={`/services/${service.slug}`}
      className="service-card"
    >
      <div className="service-icon">{service.icon}</div>
      <h3 className="service-name">{service.name}</h3>
      <p className="service-description">{service.description}</p>
    </Link>
  )
}

function ServicesPreview() {
  const [ref, isVisible] = useScrollAnimation()
  const parallaxRef = useSectionParallax(0.01)

  return (
    <section ref={parallaxRef} className="services-preview">
      <div className="services-preview-container">
        <div className="services-preview-header">
          <h2>Our Services</h2>
          <Link to="/services" className="view-all-link">
            View All <span className="view-all-arrow">→</span>
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