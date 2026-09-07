import { useEffect } from 'react'
import './ConfirmModal.css'

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
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
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="confirm-modal-btn confirm-modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-modal-btn confirm-modal-btn-confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
