import { Link } from 'react-router-dom'
import { portfolioItems } from '../data/portfolio'
import './Portfolio.css'

function Portfolio() {
  return (
    <div className="portfolio-page">
      <section className="portfolio-hero">
        <h1 className="portfolio-hero-title">Our Work</h1>
        <p className="portfolio-hero-subtitle">
          A showcase of products and platforms we've built for businesses across different industries.
        </p>
      </section>

      <section className="portfolio-list">
        <div className="portfolio-list-grid">
          {portfolioItems.map((item) => (
            <div className="portfolio-item-card" key={item.id}>
              <div className="portfolio-item-image">{item.image}</div>

              <div className="portfolio-item-content">
                <span className="portfolio-item-category">{item.category}</span>
                <h3 className="portfolio-item-title">{item.title}</h3>
                <p className="portfolio-item-description">{item.description}</p>

                <div className="portfolio-item-tech">
                  {item.technologies.map((tech, index) => (
                    <span key={index} className="tech-badge">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="portfolio-cta">
        <h2>Want to see your project here next?</h2>
        <p>Let's build something great together.</p>
        <Link to="/contact" className="portfolio-cta-btn">
          Start a Project
        </Link>
      </section>
    </div>
  )
}

export default Portfolio