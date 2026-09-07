import { useEffect, useState } from 'react'
import { agentStatus } from '../../support/live/agentStatus'
import { handoffManager } from '../../support/live/handoff'
import './SupportHeader.css'

function SupportHeader({ onClose, onBack, showBackButton }) {
  const conversationState = handoffManager.getConversationState()
  const [isAdminAvailable, setIsAdminAvailable] = useState(false)

  // Subscribe to REAL admin availability from Firestore, so this
  // actually reflects the dashboard's online/away/offline toggle
  // instead of always showing "Offline".
  useEffect(() => {
    const unsubscribe = agentStatus.listenToAnyAdminAvailable((available) => {
      setIsAdminAvailable(available)
    })
    return () => unsubscribe && unsubscribe()
  }, [])

  const getStatusText = () => {
    if (conversationState === 'human') {
      return '🟢 Support Agent Online'
    }
    if (conversationState === 'waiting-admin') {
      return '🟡 Connecting to Support...'
    }
    if (isAdminAvailable) {
      return '🟢 Online • Customer Support'
    }
    return '🔴 Offline • Customer Support'
  }

  const getStatusClass = () => {
    if (conversationState === 'human') {
      return 'online'
    }
    if (conversationState === 'waiting-admin') {
      return 'away'
    }
    return isAdminAvailable ? 'online' : 'offline'
  }

  return (
    <div className="support-header">
      <div className="support-header-content">
        <div className="support-header-title">
          {showBackButton && (
            <button className="support-header-back" onClick={onBack} aria-label="Go back">
              ←
            </button>
          )}
          <span className="support-header-icon">🤖</span>
          <span>OROFEX Support</span>
        </div>
        <div className={`support-header-status ${getStatusClass()}`}>
          <span className="support-status-dot"></span>
          <span>{getStatusText()}</span>
        </div>
      </div>
      <button className="support-header-close" onClick={onClose} aria-label="Close chat">
        ✕
      </button>
    </div>
  )
}

export default SupportHeader
