import './ProductVisual.css'

function ProductVisual({ product, className = '' }) {
  if (product.coverImage) {
    return (
      <img
        className={`product-visual-image ${className}`}
        src={product.coverImage}
        alt={`${product.name} screenshot`}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <div className={`product-visual-fallback ${className}`} aria-label={`${product.name} screenshot pending`}>
      {product.name.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default ProductVisual
