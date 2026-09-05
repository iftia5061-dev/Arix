import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './About.css'

const companyStats = [
  { value: '5+', label: 'Years Experience' },
  { value: '150+', label: 'Projects Delivered' },
  { value: '40+', label: 'Happy Clients' },
  { value: '25+', label: 'Digital Products' }
]

const values = [
  {
    icon: '🚀',
    title: 'Innovation First',
    description: 'We embrace cutting-edge technologies and creative solutions to deliver products that stand ahead of the curve.'
  },
  {
    icon: '💎',
    title: 'Quality Excellence',
    description: 'Every project undergoes rigorous testing and refinement to ensure premium quality and exceptional user experience.'
  },
  {
    icon: '🤝',
    title: 'Client Partnership',
    description: 'We believe in building long-term relationships with our clients through transparency, communication, and results-driven collaboration.'
  },
  {
    icon: '🌍',
    title: 'Global Impact',
    description: 'Our solutions serve clients worldwide, creating meaningful digital experiences that transcend geographical boundaries.'
  }
]

function About() {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <div className="about-page">
      <section className="about-hero">
        <span className="about-label">ABOUT OROFEX</span>
        <h1 className="about-hero-title">Building Digital Excellence Since 2019</h1>
        <p className="about-hero-subtitle">
          Orofex is a premier digital products company specializing in AI-powered solutions, 
          custom software development, and innovative web applications. We transform complex ideas 
          into elegant, user-friendly digital experiences that drive business growth.
        </p>
      </section>

      <section className="about-content">
        <div className="about-description">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-text">
            To empower businesses with intelligent digital solutions that enhance productivity, 
            streamline operations, and create meaningful connections with their customers. 
            We believe in the power of technology to transform industries and improve lives.
          </p>

          <h2 className="about-section-title">Our Vision</h2>
          <p className="about-text">
            To become the global leader in AI-driven digital products, setting new standards 
            for innovation, quality, and customer satisfaction in the tech industry.
          </p>
        </div>

        <div className="about-stats">
          {companyStats.map((stat, index) => (
            <div key={index} className="about-stat">
              <div className="about-stat-value">{stat.value}</div>
              <div className="about-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-technology">
        <div className="about-technology-container">
          <h2 className="about-technology-title">Our Technology</h2>
          <p className="about-technology-subtitle">
            We build with modern, proven technologies to deliver fast, secure, and scalable products.
          </p>

          <div className="tech-tags">
            <span className="tech-tag">React</span>
            <span className="tech-tag">Node.js</span>
            <span className="tech-tag">Python</span>
            <span className="tech-tag">AI / ML</span>
            <span className="tech-tag">Cloud Infrastructure</span>
            <span className="tech-tag">REST & GraphQL APIs</span>
            <span className="tech-tag">React Native</span>
            <span className="tech-tag">PostgreSQL</span>
          </div>
        </div>
      </section>

      <section ref={ref} className={`about-values reveal ${isVisible ? 'visible' : ''}`}>
        <h2 className="about-values-title">Our Core Values</h2>
        <div className="about-values-grid">
          {values.map((value, index) => (
            <div
              className="about-value-card"
              key={index}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="about-value-icon">{value.icon}</div>
              <h3 className="about-value-title">{value.title}</h3>
              <p className="about-value-description">{value.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default About