import { useState } from 'react'
import './SupportLauncher.css'

function SupportLauncher({ isOpen, onToggle }) {
  return (
    <button
      className={`support-launcher ${isOpen ? 'support-launcher-open' : ''}`}
      onClick={onToggle}
      aria-label="Open support chat"
    >
      <span className="support-launcher-icon">💬</span>
      <span className="support-launcher-text">Need Help?</span>
    </button>
  )
}

export default SupportLauncher
