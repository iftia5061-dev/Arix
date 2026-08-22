import { useState } from 'react'
import { usePublishedProducts } from '../../hooks/usePublishedProducts'
import ProductPreviewModal from '../common/ProductPreviewModal'
import ProductVisual from '../common/ProductVisual'
import './ProductMarquee.css'

const ITEMS_PER_ROW = 15

function chunkIntoRows(items, size) {
  const rows = []
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size))
  }
  return rows
}

function MarqueeRow({ items, reverse, onSelect }) {
  const repeatCount = items.length <= 4 ? 4 : 2
  const loopedItems = Array.from({ length: repeatCount }, () => items).flat()
  const animationDuration = `${loopedItems.length * 3}s`

  return (
    <div className="product-marquee-track-wrapper">
      <div
        className={`product-marquee-track ${reverse ? 'reverse' : ''}`}
        style={{ animationDuration }}
      >
        {loopedItems.map((product, index) => (
          <button
            key={`${product.id}-${index}`}
            className="marquee-item"
            onClick={() => onSelect(product)}
          >
            <span className="marquee-product-image"><ProductVisual product={product} /></span>
            <span className="marquee-name">{product.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ProductMarquee() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { products, loading } = usePublishedProducts()
  const displayProducts = products

  if (loading || displayProducts.length === 0) return null

  const rows = chunkIntoRows(displayProducts, ITEMS_PER_ROW)

  return (
    <>
      <section className="product-marquee">
        <p className="product-marquee-label">Ready to Use — Available Now</p>

        <div className="product-marquee-rows">
          {rows.map((rowItems, rowIndex) => (
            <MarqueeRow
              key={rowIndex}
              items={rowItems}
              reverse={rowIndex % 2 === 1}
              onSelect={setSelectedProduct}
            />
          ))}
        </div>
      </section>

      {selectedProduct && (
        <ProductPreviewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}

export default ProductMarquee
