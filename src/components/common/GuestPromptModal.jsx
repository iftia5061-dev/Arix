import { useState, useEffect } from 'react'
import { useAuth } from '../../context/authStore'
import './GuestPromptModal.css'

function GuestPromptModal() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      const hasSeen = localStorage.getItem('guestPromptSeen')
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsOpen(true)
          localStorage.setItem('guestPromptSeen', 'true')
        }, 10000) // Show after 10 seconds
        return () => clearTimeout(timer)
      }
    }
  }, [user])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleLogin = () => {
    window.location.href = '/dashboard'
    handleClose()
  }

  if (!isOpen || user) return null

  return (
    <div className="guest-prompt-overlay" onClick={handleClose}>
      <div className="guest-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="guest-prompt-close" onClick={handleClose}>×</button>
        <div className="guest-prompt-icon">👋</div>
        <h2 className="guest-prompt-title">Join OROFEX</h2>
        <p className="guest-prompt-message">
          Create an account to unlock personalized features and customize your experience.
        </p>
        <div className="guest-prompt-actions">
          <button className="guest-prompt-btn primary" onClick={handleLogin}>
            Login / Sign Up
          </button>
          <button className="guest-prompt-btn secondary" onClick={handleClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default GuestPromptModal
