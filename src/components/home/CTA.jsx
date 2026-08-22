import { Link } from 'react-router-dom'
import './CTA.css'

function CTA() {
  return (
    <section className="cta">
      <div className="cta-glow"></div>

      <div className="cta-container">
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