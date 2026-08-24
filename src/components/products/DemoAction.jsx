import { useState } from 'react'
import PreviewModal from './PreviewModal'

function DemoAction({ demoUrl, previewHtml, checkoutUrl, productName, coverImage, behavior, className = '' }) {
  const [showPreview, setShowPreview] = useState(false)

  if (!behavior) return null
  if (behavior === 'direct' && !demoUrl) return null
  if (behavior === 'preview' && !demoUrl && !previewHtml) return null

  // Showcase products (not for sale) get a plain, direct link — nothing to protect.
  if (behavior === 'direct') {
    return (
      <a href={demoUrl} target="_blank" rel="noopener noreferrer" className={className}>
        Demo
      </a>
    )
  }

  // Sale products get the locked, click-blocked preview instead of a direct link.
  return (
    <>
      <button type="button" className={className} onClick={() => setShowPreview(true)}>
        Demo
      </button>
      {showPreview && (
        <PreviewModal
          demoUrl={demoUrl}
          previewHtml={previewHtml}
          checkoutUrl={checkoutUrl}
          productName={productName}
          coverImage={coverImage}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}

export default DemoAction