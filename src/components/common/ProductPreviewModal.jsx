import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductVisual from './ProductVisual'
import { formatPrice, isSaleProduct } from '../../data/productSchema'
import CheckoutButton from '../products/CheckoutButton'
import './ProductPreviewModal.css'

function ProductPreviewModal({ product, onClose }) {
  const [activeImage, setActiveImage] = useState(0)
  const images = product.images.length > 0 ? product.images : [product.coverImage]

  useEffect(() => {
    setActiveImage(0)
  }, [product.id])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const activeProduct = { ...product, coverImage: images[activeImage] || product.coverImage }
  const saleProduct = isSaleProduct(product)

  return (
    <div className="preview-modal-overlay" onMouseDown={onClose} role="presentation">
      <section className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="preview-modal-close" type="button" onClick={onClose} aria-label="Close quick view">×</button>

        <div className="preview-modal-media">
          <ProductVisual product={activeProduct} />
        </div>

        {images.length > 1 && (
          <div className="preview-modal-thumbnails" aria-label="Product screenshots">
            {images.map((image, index) => (
              <button
                type="button"
                key={image}
                className={index === activeImage ? 'active' : ''}
                onClick={() => setActiveImage(index)}
                aria-label={`Show screenshot ${index + 1}`}
              >
                <img src={image} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        )}

        <div className="preview-modal-body">
          <div className="preview-modal-heading">
            <div>
              <span className="preview-modal-platform">{product.platforms.join(' · ')}</span>
              <h2 id="preview-modal-title">{product.name}</h2>
            </div>
            <strong>{saleProduct ? formatPrice(product.pricing) : 'Built by ARIX'}</strong>
          </div>
          <p>{product.shortDescription}</p>

          {product.features.length > 0 && (
            <ul className="preview-modal-features">
              {product.features.slice(0, 4).map((feature) => <li key={feature}>✓ {feature}</li>)}
            </ul>
          )}

          <div className="preview-modal-actions">
            {product.links.demoUrl && <a href={product.links.demoUrl} target="_blank" rel="noopener noreferrer" className="preview-btn-primary">Demo</a>}
            <Link to={`/products/${product.slug}`} onClick={onClose} className="preview-btn-details">View Product Details</Link>
            {saleProduct && <CheckoutButton productId={product.id} className="preview-btn-buy">Buy Now</CheckoutButton>}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductPreviewModal
