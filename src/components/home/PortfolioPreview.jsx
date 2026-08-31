import { Link } from 'react-router-dom'
import { portfolioItems } from '../../data/portfolio'
import useTilt from '../../hooks/useTilt'
import './PortfolioPreview.css'

function PortfolioCard({ item }) {
  const tiltRef = useTilt(5)

  return (
    <div ref={tiltRef} className="portfolio-card glass-panel glow-hover">
      <div className="portfolio-image">{item.image}</div>
      <div className="portfolio-overlay">
        <span className="portfolio-category">{item.category}</span>
        <h3 className="portfolio-title">{item.title}</h3>
      </div>
    </div>
  )
}

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

        <div className="portfolio-preview-grid fade-up-stagger">
          {portfolioItems.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default PortfolioPreview