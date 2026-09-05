import { Link } from 'react-router-dom'
import ProductVisual from '../common/ProductVisual'
import { formatPrice, isSaleProduct, getCategoryGradient, getCategoryGlowColor, getCategoryIcon } from '../../data/productSchema'
import CheckoutButton from './CheckoutButton'
import useTilt from '../../hooks/useTilt'
import useSpotlight from '../../hooks/useSpotlight'
import { mergeRefs } from '../../utils/mergeRefs'
import './ProductCard.css'

function ProductCard({ product, onQuickView, compact = false, index = 0 }) {
  const saleProduct = isSaleProduct(product)
  const tiltRef = useTilt(8)
  const spotlightRef = useSpotlight()
  const categoryGradient = getCategoryGradient(product.category)
  const categoryGlowColor = getCategoryGlowColor(product.category)
  const categoryIcon = getCategoryIcon(product.category)

  return (
    <article
      ref={mergeRefs(tiltRef, spotlightRef)}
      className={`marketplace-product-card ${compact ? 'compact' : ''}`}
      style={{
        '--category-gradient': categoryGradient,
        '--category-glow': categoryGlowColor,
        animationDelay: `${index * 150}ms`
      }}
    >
      <Link to={`/products/${product.slug}`} className="marketplace-product-media" aria-label={`View ${product.name}`}>
        <ProductVisual product={product} />
        <span className="marketplace-product-category">{categoryIcon} {product.category}</span>
      </Link>
      <div className="marketplace-product-content">
        <div className="marketplace-product-heading">
          <h3><Link to={`/products/${product.slug}`}>{product.name}</Link></h3>
          {product.platforms.length > 0 && <span>{product.platforms.join(' · ')}</span>}
        </div>
        <p>{product.shortDescription}</p>
        <div className="marketplace-product-bottom">
          <strong>{saleProduct ? formatPrice(product.pricing) : 'Built by Orofex'}</strong>
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
