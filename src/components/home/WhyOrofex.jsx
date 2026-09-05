import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import useSectionParallax from '../../hooks/useSectionParallax'
import './WhyOrofex.css'

const companyStats = [
  { value: '5+', label: 'Years Experience' },
  { value: '150+', label: 'Projects Delivered' },
  { value: '40+', label: 'Happy Clients' },
  { value: '25+', label: 'Digital Products' }
]

const values = [
  {
    icon: '�',
    title: 'Innovation First',
    description: 'We embrace cutting-edge technologies and creative solutions to deliver products that stand ahead of the curve.'
  },
  {
    icon: '�',
    title: 'Quality Excellence',
    description: 'Every project undergoes rigorous testing and refinement to ensure premium quality and exceptional user experience.'
  }
]

function WhyOrofex() {
  const [ref, isVisible] = useScrollAnimation()
  const parallaxRef = useSectionParallax(0.01)

  return (
    <section ref={parallaxRef} className="why-Orofex">
      <div className="why-Orofex-container">
        <div className="why-Orofex-header">
          <span className="why-Orofex-label">ABOUT OROFEX</span>
          <h2 className="why-Orofex-title">Building Digital Excellence Since 2019</h2>
          <p className="why-Orofex-subtitle">
            Orofex is a premier digital products company specializing in AI-powered solutions, 
            custom software development, and innovative web applications. We transform complex ideas 
            into elegant, user-friendly digital experiences that drive business growth.
          </p>
        </div>

        <div className="why-Orofex-content">
          <div className="why-Orofex-description">
            <h3 className="why-Orofex-section-title">Our Mission</h3>
            <p className="why-Orofex-text">
              To empower businesses with intelligent digital solutions that enhance productivity, 
              streamline operations, and create meaningful connections with their customers. 
              We believe in the power of technology to transform industries and improve lives.
            </p>

            <h3 className="why-Orofex-section-title">Our Vision</h3>
            <p className="why-Orofex-text">
              To become the global leader in AI-driven digital products, setting new standards 
              for innovation, quality, and customer satisfaction in the tech industry.
            </p>
          </div>

          <div className="why-Orofex-stats">
            {companyStats.map((stat, index) => (
              <div key={index} className="why-Orofex-stat">
                <div className="why-Orofex-stat-value">{stat.value}</div>
                <div className="why-Orofex-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div ref={ref} className={`why-Orofex-values reveal ${isVisible ? 'visible' : ''}`}>
          {values.map((value, index) => (
            <div
              className="why-Orofex-value-card"
              key={index}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="why-Orofex-value-icon">{value.icon}</div>
              <h3 className="why-Orofex-value-title">{value.title}</h3>
              <p className="why-Orofex-value-description">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyOrofex