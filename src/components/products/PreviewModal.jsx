import { useEffect, useState } from 'react'
import CheckoutButton from './CheckoutButton'
import './PreviewModal.css'

function PreviewModal({ demoUrl, checkoutUrl, productName, images = [], onClose }) {
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="demo-preview-backdrop" onMouseDown={onClose} role="presentation">
      <section className="demo-preview-window" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="demo-preview-title">
        <header className="demo-preview-bar">
          <span id="demo-preview-title" className="demo-preview-title">{productName} — Preview</span>
          <div className="demo-preview-header-actions">
            {checkoutUrl && <CheckoutButton checkoutUrl={checkoutUrl}>Buy Now</CheckoutButton>}
            <button type="button" className="demo-preview-close-btn" onClick={onClose}>Close <span aria-hidden="true">×</span></button>
          </div>
        </header>

        <div className="demo-preview-banner">
          Scroll to explore the product. Preview links stay inside this protected window.
          {!showFallback && (
            <button type="button" className="demo-preview-fallback-toggle" onClick={() => setShowFallback(true)}>
              View screenshots instead
            </button>
          )}
        </div>

        {showFallback ? (
          <div className="demo-preview-fallback">
            {images.length > 0 ? (
              <div className="demo-preview-fallback-images">
                {images.map((image) => (
                  <img key={image} src={image} alt={`${productName} screenshot`} loading="lazy" />
                ))}
              </div>
            ) : (
              <p className="demo-preview-fallback-empty">No screenshots are available for this product yet.</p>
            )}
          </div>
        ) : (
          <div className="demo-preview-frame-wrapper">
            <iframe
              src={demoUrl}
              title={`${productName} preview`}
              className="demo-preview-iframe"
              loading="lazy"
              sandbox="allow-scripts allow-forms allow-modals"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}

        {checkoutUrl && <footer className="demo-preview-footer"><CheckoutButton checkoutUrl={checkoutUrl}>Buy Now</CheckoutButton></footer>}
      </section>
    </div>
  )
}

export default PreviewModal
