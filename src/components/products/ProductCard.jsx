import { Link } from 'react-router-dom'
import ProductVisual from '../common/ProductVisual'
import { formatPrice, isSaleProduct } from '../../data/productSchema'
import CheckoutButton from './CheckoutButton'
import './ProductCard.css'

function ProductCard({ product, onQuickView, compact = false }) {
  const saleProduct = isSaleProduct(product)

  return (
    <article className={`marketplace-product-card ${compact ? 'compact' : ''}`}>
      <Link to={`/products/${product.slug}`} className="marketplace-product-media" aria-label={`View ${product.name}`}>
        <ProductVisual product={product} />
        <span className="marketplace-product-category">{product.category}</span>
      </Link>
      <div className="marketplace-product-content">
        <div className="marketplace-product-heading">
          <h3><Link to={`/products/${product.slug}`}>{product.name}</Link></h3>
          {product.platforms.length > 0 && <span>{product.platforms.join(' · ')}</span>}
        </div>
        <p>{product.shortDescription}</p>
        <div className="marketplace-product-bottom">
          <strong>{saleProduct ? formatPrice(product.pricing) : 'Built by ARIX'}</strong>
          <span className="marketplace-product-action-label">{saleProduct ? product.pricing?.type?.replace('-', ' ') : 'Showcase'}</span>
        </div>
        <div className="marketplace-product-actions">
          <button type="button" onClick={() => onQuickView(product)}>Quick View</button>
          <Link to={`/products/${product.slug}`}>View Product</Link>
          {saleProduct && <CheckoutButton checkoutUrl={product.links.checkoutUrl} className="marketplace-product-primary-action">Buy Now</CheckoutButton>}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
