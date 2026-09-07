import { useState } from 'react'
import './SupportInput.css'

function SupportInput({ onSend, disabled = false }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim() && !disabled) {
      onSend(text.trim())
      setText('')
    }
  }

  return (
    <div className="support-input">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? 'Chat with support agent...' : 'Ask about OROFEX...'}
          className="support-input-field"
          disabled={disabled}
        />
        <button
          type="submit"
          className="support-input-button"
          disabled={!text.trim() || disabled}
          aria-label="Send message"
        >
          ➤
        </button>
      </form>
    </div>
  )
}

export default SupportInput
