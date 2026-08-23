import { useState } from 'react'
import PreviewModal from './PreviewModal'
import './ProductActions.css'

function DemoAction({ demoUrl, checkoutUrl, productName, images = [], className = '' }) {
  const [showPreview, setShowPreview] = useState(false)

  if (!demoUrl) return null

  return (
    <>
      <button type="button" className={`product-commerce-action product-commerce-action--demo ${className}`.trim()} onClick={() => setShowPreview(true)}>
        Preview demo
      </button>
      {showPreview && (
        <PreviewModal
          demoUrl={demoUrl}
          checkoutUrl={checkoutUrl}
          productName={productName}
          images={images}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}

export default DemoAction
