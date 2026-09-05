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
          <a href="https://wa.me/8801910892757" target="_blank" rel="noopener noreferrer" className="social-icon social-icon-whatsapp" aria-label="Contact via WhatsApp">
            <svg viewBox="0 0 32 32" fill="currentColor">
              <path d="M16.001 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.257.593 4.446 1.72 6.374L3.2 28.8l6.6-1.702c1.856 1.012 3.951 1.548 6.201 1.548h.006c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.332-6.636-3.75-9.054C22.638 4.532 19.421 3.2 16.001 3.2zm0 23.36h-.005c-1.99 0-3.94-.535-5.639-1.548l-.404-.24-4.19 1.083 1.118-4.086-.263-.42a10.535 10.535 0 0 1-1.617-5.65c0-5.844 4.756-10.6 10.605-10.6 2.832 0 5.494 1.104 7.497 3.108a10.53 10.53 0 0 1 3.103 7.497c0 5.844-4.757 10.6-10.605 10.6zm5.812-7.938c-.319-.16-1.887-.931-2.179-1.038-.292-.107-.505-.16-.717.16-.213.32-.824 1.038-1.01 1.251-.186.213-.372.24-.691.08-.319-.16-1.347-.497-2.566-1.584-.949-.847-1.59-1.893-1.776-2.213-.186-.32-.02-.492.14-.652.144-.144.319-.373.478-.56.16-.186.213-.32.32-.532.106-.213.053-.4-.027-.56-.08-.16-.717-1.728-.983-2.366-.259-.62-.522-.536-.717-.546a13.86 13.86 0 0 0-.611-.011c-.213 0-.56.08-.852.4-.293.32-1.118 1.093-1.118 2.665s1.145 3.09 1.304 3.303c.16.213 2.253 3.44 5.46 4.823.763.33 1.359.527 1.823.674.766.244 1.463.21 2.014.127.614-.092 1.887-.771 2.153-1.516.266-.746.266-1.385.186-1.518-.08-.133-.293-.213-.612-.373z"/>
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
