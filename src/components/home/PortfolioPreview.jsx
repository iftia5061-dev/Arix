import { Link } from 'react-router-dom'
import { portfolioItems } from '../../data/portfolio'
import './PortfolioPreview.css'

function PortfolioPreview() {
  return (
    <section className="portfolio-preview">
      <div className="portfolio-preview-container">
        <div className="portfolio-preview-header">
          <h2>Our Work</h2>
          <Link to="/portfolio" className="view-all-link">
            View All →
          </Link>
        </div>

        <div className="portfolio-preview-grid">
          {portfolioItems.map((item) => (
            <div className="portfolio-card" key={item.id}>
              <div className="portfolio-image">{item.image}</div>
              <div className="portfolio-overlay">
                <span className="portfolio-category">{item.category}</span>
                <h3 className="portfolio-title">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PortfolioPreview