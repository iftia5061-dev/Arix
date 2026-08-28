import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="footer-logo">Orofex</h3>
            <p className="footer-tagline">Digital Products & Solutions</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-col wide">
              <h4>Explore</h4>
              <ul>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/web-design">Web Design</Link></li>
                <li><Link to="/ai-bot">AI Bot</Link></li>
                <li><Link to="/software">Software</Link></li>
                <li><Link to="/tools">Tools</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/ai">AI Solutions</Link></li>
                <li><Link to="/portfolio">Portfolio</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Orofex. All rights reserved. · <Link to="/admin" className="footer-admin-link">Admin</Link></p>
        </div>
      </div>
    </footer>
  )
}

export default Footer