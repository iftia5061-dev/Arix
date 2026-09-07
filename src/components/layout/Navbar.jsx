import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authStore'
import { debounce } from '../../utils/debounce'
import WelcomeModal from '../common/WelcomeModal'
import './Navbar.css'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { user, isAdmin, loginWithGoogle, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Wait for auth to be ready
    const checkAuth = () => {
      setIsAuthReady(true)
    }
    
    // Use a small timeout to ensure auth is initialized
    const timeout = setTimeout(checkAuth, 100)
    return () => clearTimeout(timeout)
  }, [])

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
        setShowWelcomeModal(true)
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    closeMenu()
    navigate('/')
  }

  const handleNavigation = (path) => {
    closeMenu()
    navigate(path)
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
          <li><button onClick={() => handleNavigation('/')} className="navbar-link-btn">Home</button></li>
          <li><button onClick={() => handleNavigation('/products')} className="navbar-link-btn">Products</button></li>
          <li><button onClick={() => handleNavigation('/pricing')} className="navbar-link-btn">Pricing</button></li>
          <li><button onClick={() => handleNavigation('/about')} className="navbar-link-btn">About</button></li>
          {!isAdmin && <li><button onClick={() => handleNavigation('/contact')} className="navbar-link-btn navbar-order-link">Order Now</button></li>}
          {user && !isAdmin && <li><button onClick={() => handleNavigation('/dashboard')} className="navbar-link-btn navbar-dashboard-link">My Orders</button></li>}
          {isAdmin && <li><button onClick={() => handleNavigation('/admin')} className="navbar-link-btn navbar-dashboard-link">Admin Panel</button></li>}

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
              {user.photoURL && !imageError ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="navbar-user-avatar"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="navbar-user-avatar navbar-user-avatar-fallback">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
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

          {!isAdmin && <button onClick={() => handleNavigation('/contact')} className="navbar-cta">
            Get Started
          </button>}
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

      <WelcomeModal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
    </nav>
  )
}

export default Navbar
