import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories } from '../data/categories'
import { usePublishedProducts } from '../hooks/usePublishedProducts'
import ProductCard from '../components/products/ProductCard'
import ProductPreviewModal from '../components/common/ProductPreviewModal'
import './Products.css'

function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const requestedCategory = searchParams.get('category')
  const activeCategory = ['all', ...categories.map((category) => category.slug)].includes(requestedCategory)
    ? requestedCategory
    : 'all'
  const { products, loading, error } = usePublishedProducts()

  const filteredProducts = useMemo(() => (
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory)
  ), [activeCategory, products])

  useEffect(() => {
    if (!requestedCategory || activeCategory === requestedCategory) return
    setSearchParams({})
  }, [activeCategory, requestedCategory, setSearchParams])

  const selectCategory = (category) => {
    setSearchParams(category === 'all' ? {} : { category })
  }

  return (
    <div className="products-page">
      <section className="products-hero">
        <h1 className="products-hero-title">Our Products</h1>
        <p className="products-hero-subtitle">
          Explore ARIX's full range of software, SaaS, AI, and mobile solutions built to power your business.
        </p>
      </section>

      <section className="products-filter">
        <div className="products-filter-container">
          <button
            className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => selectCategory('all')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-chip ${activeCategory === cat.slug ? 'active' : ''}`}
              onClick={() => selectCategory(cat.slug)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section className="products-list">
        {loading ? (
          <div className="products-empty"><p>Loading products…</p></div>
        ) : error ? (
          <div className="products-empty"><p>Products could not be loaded right now. Please try again shortly.</p></div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-list-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="products-empty">
            <p>No products found in this category yet.</p>
          </div>
        )}
      </section>

      {selectedProduct && <ProductPreviewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  )
}

export default Products
