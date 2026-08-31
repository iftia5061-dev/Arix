import { Link } from 'react-router-dom'
import GyroModel from '../common/GyroModel'
import './AISolutions.css'

const aiFeatures = [
  'Natural language processing',
  'Predictive analytics',
  'Workflow automation',
  'Intelligent chatbots',
]

function AISolutions() {
  return (
    <section className="ai-solutions">
      <div className="ai-solutions-glow"></div>

      <div className="ai-solutions-container">
        <div className="ai-solutions-content">
          <h2 className="ai-solutions-title">
            Powered by <span className="ai-highlight">Artificial Intelligence</span>
          </h2>
          <p className="ai-solutions-subtitle">
            We build AI-driven systems that automate workflows, understand data, and help your business make smarter decisions.
          </p>

          <ul className="ai-features-list">
            {aiFeatures.map((feature, index) => (
              <li key={index} className="ai-feature-item">
                <span className="ai-feature-dot"></span>
                {feature}
              </li>
            ))}
          </ul>

          <Link to="/ai" className="ai-solutions-btn btn-neon-primary">
            Explore AI Solutions
          </Link>
        </div>

        <div className="ai-solutions-visual">
          <GyroModel />
        </div>
      </div>
    </section>
  )
}

export default AISolutions