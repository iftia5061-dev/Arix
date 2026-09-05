import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductVisual from './ProductVisual'
import { formatPrice, isSaleProduct, supportsLivePreview, getCategoryGradient, getCategoryGlowColor, getCategoryIcon } from '../../data/productSchema'
import CheckoutButton from '../products/CheckoutButton'
import DemoAction from '../products/DemoAction'
import './ProductPreviewModal.css'

function ProductPreviewModal({ product, onClose }) {
  const images = product.images.length > 0 ? product.images : [product.coverImage]
  const categoryGradient = getCategoryGradient(product.category)
  const categoryGlowColor = getCategoryGlowColor(product.category)
  const categoryIcon = getCategoryIcon(product.category)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const activeProduct = { ...product, coverImage: images[0] || product.coverImage }
  const saleProduct = isSaleProduct(product)
  const demoBehavior = saleProduct ? (supportsLivePreview(product) ? 'preview' : null) : 'direct'

  return (
    <div className="preview-modal-overlay" onMouseDown={onClose} role="presentation">
      <section
        className="preview-modal blur-pop-enter"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          '--category-gradient': categoryGradient,
          '--category-glow': categoryGlowColor,
        }}
      >
        <button className="preview-modal-close" type="button" onClick={onClose} aria-label="Close quick view">×</button>

        <div className="preview-modal-media">
          <ProductVisual product={activeProduct} />
        </div>

        <div className="preview-modal-body">
          <div className="preview-modal-heading">
            <div>
              <span className="preview-modal-category">{categoryIcon} {product.category}</span>
              <h2 id="preview-modal-title">{product.name}</h2>
            </div>
            <strong>{saleProduct ? formatPrice(product.pricing) : 'Built by Orofex'}</strong>
          </div>
          <p>{product.shortDescription}</p>

          <div className="preview-modal-actions">
            {demoBehavior && <DemoAction demoUrl={product.links.demoUrl} previewHtml={product.links.previewHtml} checkoutUrl={product.links.checkoutUrl} productName={product.name} coverImage={product.coverImage} behavior={demoBehavior} className="preview-btn-primary" />}
            <Link to={`/products/${product.slug}`} onClick={onClose} className="preview-btn-details">View Product Details</Link>
            {saleProduct && <CheckoutButton checkoutUrl={product.links.checkoutUrl} className="preview-btn-buy">Buy Now</CheckoutButton>}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductPreviewModal
