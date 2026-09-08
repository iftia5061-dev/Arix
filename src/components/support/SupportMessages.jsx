import { useEffect, useRef, useState, useCallback } from 'react'
import './SupportMessages.css'
import MainMenu from './MainMenu'

function SupportMessages({ messages, onOptionClick, isLoading, isAIThinking }) {
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [isUserNearBottom, setIsUserNearBottom] = useState(true)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const lastMessageRef = useRef(null)

  // Scroll to top of chat
  const scrollToTop = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0
    }
  }, [])

  // Scroll to specific message
  const scrollToMessage = useCallback((messageIndex) => {
    const messageElements = messagesContainerRef.current?.querySelectorAll('.support-message')
    if (messageElements && messageElements[messageIndex]) {
      messageElements[messageIndex].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Check if user is near bottom of chat
  const checkScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const threshold = 100 // pixels from bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold
      setIsUserNearBottom(isNearBottom)
      return isNearBottom
    }
    return true
  }, [])

  // Scroll to bottom only when user is near bottom or when message count increases
  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current && (force || isUserNearBottom)) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isUserNearBottom])

  // Track scroll position when user manually scrolls
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      checkScrollPosition()
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [checkScrollPosition])

  // Initialize: scroll to top when chat first opens
  useEffect(() => {
    if (messages.length > 0 && !isInitialized) {
      scrollToTop()
      setIsInitialized(true)
      setLastMessageCount(messages.length)
    }
    
    // Reset initialization when messages are cleared
    if (messages.length === 0) {
      setIsInitialized(false)
      setLastMessageCount(0)
    }
  }, [messages.length, isInitialized, scrollToTop])

  // Auto-scroll to new message when added
  useEffect(() => {
    if (!isInitialized) return
    
    const messageCount = messages.length
    if (messageCount > lastMessageCount) {
      // New message added - scroll to it
      const newMessageIndex = messageCount - 1
      scrollToMessage(newMessageIndex)
      setLastMessageCount(messageCount)
    }
  }, [messages.length, lastMessageCount, scrollToMessage, isInitialized])

  // Keep scroll position check updated (but don't force scroll)
  useEffect(() => {
    checkScrollPosition()
  }, [messages, checkScrollPosition])

  return (
    <div className="support-messages" ref={messagesContainerRef}>
      {messages.map((message, index) => (
        <div
          key={message.id}
          ref={index === messages.length - 1 ? lastMessageRef : null}
          className={`support-message support-message-${message.type}`}
        >
          <div className="support-message-content">
            {message.type === 'admin' && (
              <div className="support-message-sender">
                <div className="support-message-sender-icons">
                  <span className="support-message-sender-icon">👤</span>
                  <span className="support-message-sender-icon">👤</span>
                </div>
                Admin
              </div>
            )}
            {message.type === 'system' && (
              <div className="support-message-sender">
                <span className="support-message-sender-icon">⚡</span>
                System
              </div>
            )}
            {message.title && <div className="support-message-title">{message.title}</div>}
            <div className="support-message-text">{message.text}</div>
            {message.isAI && (
              <div className="support-ai-indicator">🤖 AI Response</div>
            )}
            {isLoading && message.type === 'bot' && !message.isAI && (
              <div className="support-loading">Loading...</div>
            )}
            {isAIThinking && (
              <div className="support-ai-thinking">🤖 Thinking...</div>
            )}
            {message.products && (
              <div className="support-products-list">
                {message.products.map((product) => (
                  <div key={product.id} className="support-product-item">
                    <div className="support-product-name">{product.name}</div>
                    <div className="support-product-price">{product.price}</div>
                    <button
                      className="support-product-view"
                      onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                    >
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            )}
            {message.options && !isLoading && <MainMenu options={message.options} onOptionClick={onOptionClick} />}
            {message.action && (
              <a
                href={message.action}
                target="_blank"
                rel="noopener noreferrer"
                className="support-action-link"
              >
                Visit Page →
              </a>
            )}
            {message.whatsappUrl && (
              <a
                href={message.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="support-whatsapp-link"
              >
                📱 Continue on WhatsApp →
              </a>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default SupportMessages
