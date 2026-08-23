import { useState } from 'react'
import PreviewModal from './PreviewModal'
import './ProductActions.css'

function DemoAction({ demoUrl, checkoutUrl, productName, coverImage, behavior = 'preview', className = '' }) {
  const [showPreview, setShowPreview] = useState(false)

  if (!demoUrl) return null

  if (behavior === 'direct') {
    return (
      <a href={demoUrl} target="_blank" rel="noopener noreferrer" className={`product-commerce-action product-commerce-action--demo ${className}`.trim()}>
        Visit live website
      </a>
    )
  }

  return (
    <>
      <button type="button" className={`product-commerce-action product-commerce-action--demo ${className}`.trim()} onClick={() => setShowPreview(true)}>
        Live preview
      </button>
      {showPreview && (
        <PreviewModal
          demoUrl={demoUrl}
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