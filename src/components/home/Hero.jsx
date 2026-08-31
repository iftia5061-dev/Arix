import { Link } from 'react-router-dom'
import useMagnetic from '../../hooks/useMagnetic'
import useTypewriterLines from '../../hooks/useTypewriterLines'
import GyroModel from '../common/GyroModel'
import './Hero.css'

const heroLines = [
  'Building the Future with Digital Products & AI Solutions',
  'Orofex creates powerful software, SaaS platforms, mobile apps, and AI-driven solutions to help your business grow.',
]

function Hero() {
  const magneticPrimary = useMagnetic(0.25)
  const magneticSecondary = useMagnetic(0.25)
  const [line1, line2] = useTypewriterLines(heroLines, 25, 4000)

  return (
    <section className="hero">
      <div className="hero-corner-box">
        <div className="hero-corner-glow"></div>
        <p className="hero-corner-line hero-corner-line-1">
          {line1}
          {line1.length < heroLines[0].length && <span className="typing-cursor"></span>}
        </p>
        <p className="hero-corner-line hero-corner-line-2">
          {line2}
          {line1.length === heroLines[0].length && line2.length < heroLines[1].length && <span className="typing-cursor"></span>}
        </p>
      </div>

      <h1 className="hero-title-visually-hidden">
        Building the Future with Digital Products & AI Solutions
      </h1>

      <div className="hero-glow"></div>
      <div className="hero-gyro">
        <GyroModel />
      </div>
      <div className="hero-container fade-up-stagger">
        <div className="hero-badge glass-panel">
          <span className="hero-badge-dot"></span>
          AI-Powered Digital Solutions
        </div>

        <div className="hero-actions">
          <Link ref={magneticPrimary} to="/contact" className="hero-btn-primary btn-neon-primary">
            Start a Project
          </Link>
          <Link ref={magneticSecondary} to="/products" className="hero-btn-secondary btn-neon-secondary">
            Explore Products
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero