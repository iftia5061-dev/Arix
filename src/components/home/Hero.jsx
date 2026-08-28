import { Link } from 'react-router-dom'
import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow"></div>
      <div className="hero-container">
        <h1 className="hero-title">
          Building the Future with <span className="hero-highlight">Digital Products</span> & AI Solutions
        </h1>

        <p className="hero-subtitle">
          Orofex creates powerful software, SaaS platforms, mobile apps, and AI-driven solutions to help your business grow.
        </p>

        <div className="hero-actions">
          <Link to="/contact" className="hero-btn-primary">
            Start a Project
          </Link>
          <Link to="/products" className="hero-btn-secondary">
            Explore Products
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero