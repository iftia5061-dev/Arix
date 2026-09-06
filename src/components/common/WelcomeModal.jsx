import { useEffect } from 'react'
import './WelcomeModal.css'

function WelcomeModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-modal-content">
          <div className="welcome-modal-icon">🎉</div>
          <h2 className="welcome-modal-title">Welcome to Orofex!</h2>
          <p className="welcome-modal-message">
            Check your inbox for a welcome email (please check Spam/Promotions folder too).
          </p>
          <button className="welcome-modal-button" onClick={onClose}>
            Got it!
          </button>
        </div>
        <div className="welcome-modal-glow"></div>
      </div>
    </div>
  )
}

export default WelcomeModal
