import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { useAuth } from '../../context/authStore'
import './Footer.css'

function Footer() {
  const [email, setEmail] = useState('')
  const [ref, isVisible] = useScrollAnimation()
  const { user } = useAuth()

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    // Handle newsletter signup logic here
    setEmail('')
  }

  return (
    <footer ref={ref} className={`footer reveal ${isVisible ? 'visible' : ''}`}>
      <div className="footer-aurora-glow"></div>
      <div className="footer-stars"></div>
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="footer-logo">Orofex</h3>
            <p className="footer-tagline">Digital Products & Solutions</p>
            <div className="footer-newsletter">
              <p className="newsletter-text">Get exclusive deals and updates</p>
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/blog">Blog</Link></li>
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
          <div className="footer-bottom-left">
            <p>&copy; {new Date().getFullYear()} Orofex. All rights reserved.</p>
          </div>
          <div className="footer-bottom-right">
            <Link to="/privacy" className="footer-bottom-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-bottom-link">Terms of Service</Link>
            {user?.email === 'iftia5061@gmail.com' && (
              <Link to="/admin" className="footer-admin-link">Admin</Link>
            )}
          </div>
        </div>

        <div className="footer-social">
          <a href="https://www.linkedin.com/company/orofex/" target="_blank" rel="noopener noreferrer" className="social-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>

        <div className="footer-contact">
          <div className="contact-item">
            <svg viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>contact@orofex.com</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
