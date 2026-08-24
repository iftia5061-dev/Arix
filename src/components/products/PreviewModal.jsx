import { useEffect, useRef, useState } from 'react'
import CheckoutButton from './CheckoutButton'
import './PreviewModal.css'

// X-Frame-Options/CSP blocks can't be reliably detected client-side for a
// real external demoUrl (see notes below). This detection is only needed
// for the demoUrl branch — an uploaded previewHtml is always same-origin
// (srcDoc), so it can never be blocked and skips this entirely.
const LOAD_TIMEOUT_MS = 6000
const FAST_LOAD_THRESHOLD_MS = 400

function PreviewModal({ demoUrl, previewHtml, checkoutUrl, productName, coverImage, onClose }) {
  const iframeRef = useRef(null)
  const mountTimeRef = useRef(Date.now())
  // An uploaded previewHtml is guaranteed to render (same-origin), so start
  // it straight at 'loaded' and never run the blocked-detection heuristics.
  const [previewState, setPreviewState] = useState(previewHtml ? 'loaded' : 'loading')

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
    if (previewHtml) return undefined // no detection needed for same-origin content
    const timeoutId = window.setTimeout(() => {
      setPreviewState((current) => (current === 'loading' ? 'blocked' : current))
    }, LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(timeoutId)
  }, [demoUrl, previewHtml])

  function handleIframeLoad() {
    if (previewHtml) return // not applicable to same-origin srcDoc content
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

          {previewHtml ? (
            // Self-contained HTML (from an uploaded zip) — same-origin, so
            // X-Frame-Options / CSP frame-ancestors never apply to this.
            // No allow-scripts on purpose: homepage previews are HTML/CSS only.
            <iframe
              srcDoc={previewHtml}
              title={`${productName} live preview`}
              className="demo-preview-iframe"
              sandbox="allow-same-origin"
            />
          ) : (
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
          )}
        </div>

        {checkoutUrl && <footer className="demo-preview-footer"><CheckoutButton checkoutUrl={checkoutUrl}>Buy Now</CheckoutButton></footer>}
      </section>
    </div>
  )
}

export default PreviewModal