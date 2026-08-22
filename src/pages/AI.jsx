import { Link } from 'react-router-dom'
import './AI.css'

const aiCapabilities = [
  {
    icon: '💬',
    title: 'Intelligent Chatbots',
    description: 'AI-powered chatbots that understand context and handle customer queries around the clock.',
  },
  {
    icon: '📈',
    title: 'Predictive Analytics',
    description: 'Forecast trends and make data-driven decisions with machine learning models trained on your data.',
  },
  {
    icon: '⚙️',
    title: 'Workflow Automation',
    description: 'Automate repetitive tasks and business processes, freeing your team to focus on what matters.',
  },
  {
    icon: '🔍',
    title: 'Natural Language Processing',
    description: 'Extract insights, summarize documents, and understand sentiment from large volumes of text.',
  },
  {
    icon: '🖼️',
    title: 'Computer Vision',
    description: 'Image recognition and analysis systems for quality control, security, and automation.',
  },
  {
    icon: '🔐',
    title: 'Fraud Detection',
    description: 'Identify anomalies and suspicious patterns in real time to protect your business.',
  },
]

const process = [
  { step: '01', title: 'Discovery', description: 'We understand your data, goals, and workflows.' },
  { step: '02', title: 'Model Design', description: 'We design and train AI models tailored to your needs.' },
  { step: '03', title: 'Integration', description: 'We integrate the AI system into your existing platform.' },
  { step: '04', title: 'Optimization', description: 'We continuously monitor and improve model performance.' },
]

function AI() {
  return (
    <div className="ai-page">
      <section className="ai-hero">
        <div className="ai-hero-glow"></div>
        <h1 className="ai-hero-title">
          Intelligent Solutions Powered by <span className="ai-highlight">Artificial Intelligence</span>
        </h1>
        <p className="ai-hero-subtitle">
          We design and build AI systems that automate workflows, understand data, and help your business make smarter decisions.
        </p>
        <Link to="/contact" className="ai-hero-btn">
          Talk to Our AI Team
        </Link>
      </section>

      <section className="ai-capabilities">
        <h2 className="ai-section-title">What We Build</h2>
        <div className="ai-capabilities-grid">
          {aiCapabilities.map((item, index) => (
            <div className="ai-capability-card" key={index}>
              <div className="ai-capability-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ai-process">
        <h2 className="ai-section-title">Our Process</h2>
        <div className="ai-process-grid">
          {process.map((item, index) => (
            <div className="ai-process-card" key={index}>
              <span className="ai-process-step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ai-cta">
        <h2>Ready to bring AI into your business?</h2>
        <p>Let's discuss how intelligent automation can transform your workflows.</p>
        <Link to="/contact" className="ai-cta-btn">
          Start a Project
        </Link>
      </section>
    </div>
  )
}

export default AI