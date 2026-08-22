import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import './WhyArix.css'

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

function WhyArix() {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section className="why-arix">
      <div className="why-arix-container">
        <h2 className="why-arix-title">Why Choose ARIX</h2>

        <div ref={ref} className={`why-arix-grid reveal ${isVisible ? 'visible' : ''}`}>
          {reasons.map((reason, index) => (
            <div className="why-arix-card" key={index}>
              <div className="why-arix-icon">{reason.icon}</div>
              <h3 className="why-arix-name">{reason.title}</h3>
              <p className="why-arix-description">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyArix