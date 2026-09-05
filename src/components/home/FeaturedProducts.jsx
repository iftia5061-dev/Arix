import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublishedProducts } from '../../hooks/usePublishedProducts'
import useSectionParallax from '../../hooks/useSectionParallax'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import ProductCard from '../products/ProductCard'
import ProductPreviewModal from '../common/ProductPreviewModal'
import './FeaturedProducts.css'

function FeaturedProducts() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { products, loading } = usePublishedProducts()
  const parallaxRef = useSectionParallax(0.01)
  const featuredProducts = products.filter((product) => product.featured)
  const displayProducts = (featuredProducts.length > 0 ? featuredProducts : products).slice(0, 3)
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section ref={parallaxRef} className="featured-products">
      <div className="featured-products-grid-bg"></div>
      <div className="featured-products-container">
        <div className="featured-products-header">
          <h2>Featured Products</h2>
          <Link to="/products" className="view-all-link">
            View All <span className="view-all-arrow">→</span>
          </Link>
        </div>

        {loading ? <p className="featured-products-empty">Loading featured products…</p> : displayProducts.length === 0 ? <p className="featured-products-empty">New featured products are coming soon.</p> : <div
          ref={ref}
          className={`featured-products-grid reveal ${isVisible ? 'visible' : ''}`}
        >
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setSelectedProduct}
              compact
              index={index}
            />
          ))}
        </div>}
      </div>
      {selectedProduct && <ProductPreviewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </section>
  )
}

export default FeaturedProducts
