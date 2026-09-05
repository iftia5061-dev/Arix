import { Link } from 'react-router-dom'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import './CTA.css'

function CTA() {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section className="cta">
      <div className="cta-glow"></div>

      <div ref={ref} className={`cta-container reveal ${isVisible ? 'visible' : ''}`}>
        <h2 className="cta-title">Ready to Start Your Project?</h2>
        <p className="cta-subtitle">
          Let's build something powerful together. Tell us about your idea and we'll bring it to life.
        </p>
        <Link to="/contact" className="cta-btn">
          Start a Project
        </Link>
      </div>
    </section>
  )
}

export default CTA