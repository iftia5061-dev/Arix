import { useEffect, useRef } from 'react'
import './SupportMessages.css'
import MainMenu from './MainMenu'

function SupportMessages({ messages, onOptionClick, isLoading, isAIThinking }) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, isAIThinking])

  return (
    <div className="support-messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`support-message support-message-${message.type}`}
        >
          <div className="support-message-content">
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
