import { useEffect, useRef, useState } from 'react'
import CheckoutButton from './CheckoutButton'
import './PreviewModal.css'

// X-Frame-Options/CSP blocks can't be reliably detected client-side: Chrome
// renders its "refused to connect" page as if it were the target's own
// origin, so reading contentWindow.location throws a SecurityError exactly
// like a real successful cross-origin load — the about:blank check alone
// works in Firefox but not Chrome. As a second signal we also treat a very
// fast load (the local error page has no real network fetch) as blocked.
// Neither signal is 100% reliable without a server-side proxy, so a manual
// "open live site" link is always shown too as a guaranteed escape hatch.
const LOAD_TIMEOUT_MS = 6000
const FAST_LOAD_THRESHOLD_MS = 400

function PreviewModal({ demoUrl, checkoutUrl, productName, coverImage, onClose }) {
  const iframeRef = useRef(null)
  const mountTimeRef = useRef(Date.now())
  const [previewState, setPreviewState] = useState('loading') // 'loading' | 'loaded' | 'blocked'

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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPreviewState((current) => (current === 'loading' ? 'blocked' : current))
    }, LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(timeoutId)
  }, [demoUrl])

  function handleIframeLoad() {
    let blockedSignal = false
    try {
      const frameHref = iframeRef.current?.contentWindow?.location?.href
      if (!frameHref || frameHref === 'about:blank') blockedSignal = true
    } catch {
      // Ambiguous in Chrome (blocked page looks cross-origin too) — fall
      // through to the timing check below.
    }
    const elapsed = Date.now() - mountTimeRef.current
    if (blockedSignal || elapsed < FAST_LOAD_THRESHOLD_MS) {
      setPreviewState('blocked')
      return
    }
    setPreviewState('loaded')
  }

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
          Live product preview — scroll to explore. It stays inside this protected window.
        </div>

        <div className="demo-preview-frame-wrapper">
          {previewState === 'blocked' && (
            <div className="demo-preview-fallback">
              {coverImage && <img src={coverImage} alt={`${productName} screenshot`} loading="lazy" />}
              <p>Live preview isn't available for this product right now.</p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={demoUrl}
            title={`${productName} live preview`}
            className="demo-preview-iframe"
            style={previewState === 'blocked' ? { display: 'none' } : undefined}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={handleIframeLoad}
          />
        </div>

        {checkoutUrl && <footer className="demo-preview-footer"><CheckoutButton checkoutUrl={checkoutUrl}>Buy Now</CheckoutButton></footer>}
      </section>
    </div>
  )
}

export default PreviewModal