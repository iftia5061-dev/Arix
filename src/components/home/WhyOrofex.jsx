import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import './WhyOrofex.css'

const reasons = [
  {
    icon: '⚡',
    title: 'Fast Delivery',
    description: 'We ship production-ready products quickly without cutting corners.',
  },
  {
    icon: '🎯',
    title: 'Tailored Solutions',
    description: 'Every product is built around your exact business needs.',
  },
  {
    icon: '🔒',
    title: 'Secure by Design',
    description: 'Security and data protection built in from day one.',
  },
  {
    icon: '📈',
    title: 'Built to Scale',
    description: 'Architecture that grows with your business, not against it.',
  },
]

function WhyOrofex() {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section className="why-Orofex">
      <div className="why-Orofex-container">
        <h2 className="why-Orofex-title">Why Choose Orofex</h2>

        <div ref={ref} className={`why-Orofex-grid reveal ${isVisible ? 'visible' : ''}`}>
          {reasons.map((reason, index) => (
            <div className="why-Orofex-card glass-panel glow-hover" key={index}>
              <div className="why-Orofex-icon-wrap">
                <span className="why-Orofex-icon">{reason.icon}</span>
              </div>
              <h3 className="why-Orofex-name">{reason.title}</h3>
              <p className="why-Orofex-description">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyOrofex