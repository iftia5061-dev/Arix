import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/authStore'
import { debounce } from '../../utils/debounce'
import './Navbar.css'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, loginWithGoogle, logout } = useAuth()

  useEffect(() => {
    const handleScroll = debounce(() => {
      setIsScrolled(window.scrollY > 20)
    }, 16)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogin = async () => {
    try {
      const { isNewUser } = await loginWithGoogle()
      closeMenu()
      if (isNewUser) {
        alert('Welcome to Orofex! 🎉 Check your inbox for a welcome email (please check Spam/Promotions folder too).')
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    closeMenu()
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="navbar-logo-letter">O</span>
          <span className="navbar-logo-letter">r</span>
          <span className="navbar-logo-letter">o</span>
          <span className="navbar-logo-letter">F</span>
          <span className="navbar-logo-letter">e</span>
          <span className="navbar-logo-letter">X</span>
        </Link>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/products" onClick={closeMenu}>Products</Link></li>
          <li><Link to="/pricing" onClick={closeMenu}>Pricing</Link></li>
          <li><Link to="/about" onClick={closeMenu}>About</Link></li>
          <li><Link to="/contact" onClick={closeMenu} className="navbar-order-link">Order Now</Link></li>
          {user && <li><Link to="/dashboard" onClick={closeMenu} className="navbar-dashboard-link">My Orders</Link></li>}

          <li className="navbar-cta-mobile">
            {user ? (
              <button onClick={handleLogout} className="navbar-auth-btn-mobile">Logout ({user.displayName?.split(' ')[0]})</button>
            ) : (
              <button onClick={handleLogin} className="navbar-auth-btn-mobile">
                Login with Google
              </button>
            )}
          </li>
        </ul>

        <div className="navbar-right">
          {user ? (
            <div className="navbar-user">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="navbar-user-avatar" />
              ) : (
                <div className="navbar-user-avatar navbar-user-avatar-fallback">
                  {user.displayName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className="navbar-user-name">{user.displayName || user.email}</span>
              <button onClick={handleLogout} className="navbar-logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="navbar-login-btn">
              Login
            </button>
          )}

          <Link to="/contact" className="navbar-cta">
            Get Started
          </Link>
        </div>

        <button
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
