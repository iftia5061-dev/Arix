import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductVisual from '../components/common/ProductVisual'
import CheckoutButton from '../components/products/CheckoutButton'
import DemoAction from '../components/products/DemoAction'
import { formatPrice, isSaleProduct, pricingLabel } from '../data/productSchema'
import { usePublishedProducts } from '../hooks/usePublishedProducts'
import './ProductDetails.css'

function ProductDetails() {
  const { slug } = useParams()
  const { products, loading, error } = usePublishedProducts()
  const product = products.find((item) => item.slug === slug)
  const [activeImage, setActiveImage] = useState(0)
  const images = product?.images || []

  useEffect(() => setActiveImage(0), [slug])

  useEffect(() => {
    if (!product) return undefined
    const previousTitle = document.title
    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.content
    document.title = `${product.name} | ARIX`
    if (description) description.content = product.shortDescription
    return () => {
      document.title = previousTitle
      if (description) description.content = previousDescription || ''
    }
  }, [product])

  if (loading) return <div className="product-page-state">Loading product…</div>
  if (error) return <div className="product-page-state">This product could not be loaded. Please try again shortly.</div>
  if (!product) return <div className="product-not-found"><h1>Product not found</h1><p>This product is not currently available.</p><Link to="/products" className="product-action-secondary">Back to Products</Link></div>

  const saleProduct = isSaleProduct(product)
  const currentProduct = { ...product, coverImage: images[activeImage] || product.coverImage }

  return (
    <main className="product-details">
      <div className="product-details-container">
        <Link to="/products" className="back-link">← All products</Link>

        <section className="product-details-hero" aria-labelledby="product-title">
          <div className="product-gallery">
            <div className="product-gallery-main"><ProductVisual product={currentProduct} /></div>
            {images.length > 1 && <div className="product-gallery-thumbnails" aria-label="Product screenshots">
              {images.map((image, index) => <button type="button" key={image} onClick={() => setActiveImage(index)} className={activeImage === index ? 'active' : ''} aria-label={`Show screenshot ${index + 1}`}><img src={image} alt="" loading="lazy" decoding="async" /></button>)}
            </div>}
          </div>

          <div className="product-hero-copy">
            <span className="product-category-label">{saleProduct ? product.category : 'Built by ARIX · Showcase'}</span>
            <h1 id="product-title">{product.name}</h1>
            <p>{product.shortDescription}</p>
            <div className="product-summary-meta">
              {product.platforms.length > 0 && <span><b>Platforms</b>{product.platforms.join(', ')}</span>}
              {product.version && <span><b>Version</b>{product.version}</span>}
              {saleProduct && <span><b>Price</b>{formatPrice(product.pricing)}</span>}
            </div>
            <div className="product-details-actions">
              <DemoAction demoUrl={product.links.demoUrl} checkoutUrl={product.links.checkoutUrl} productName={product.name} images={product.images} className="product-action-secondary" />
              {saleProduct && <CheckoutButton checkoutUrl={product.links.checkoutUrl} className="product-action-primary">Buy Now</CheckoutButton>}
            </div>
          </div>
        </section>

        <div className="product-details-content">
          <section id="product"><h2>Product</h2><p>{product.description}</p></section>
          <section id="screenshots" className="product-screenshots-section"><h2>Screenshots</h2><div className="product-screenshots-grid">{images.map((image, index) => <img key={image} src={image} alt={`${product.name} screenshot ${index + 1}`} loading="lazy" decoding="async" />)}</div></section>
          {product.features.length > 0 && <section id="features"><h2>Features</h2><ul className="product-features-grid">{product.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul></section>}
          <section id="platforms"><h2>Platforms</h2><p>{product.platforms.join(', ')}</p></section>
          {product.requirements.length > 0 && <section id="requirements"><h2>Requirements</h2><ul className="product-standard-list">{product.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></section>}
          {product.included.length > 0 && <section id="included"><h2>What&apos;s Included</h2><ul className="product-standard-list">{product.included.map((item) => <li key={item}>{item}</li>)}</ul></section>}
          {product.license && <section id="license"><h2>License</h2><p>{product.license}</p></section>}
          {saleProduct && <section id="pricing"><h2>Pricing</h2><div className="product-info-grid"><div><p className="product-price-large">{formatPrice(product.pricing)}</p><p>{pricingLabel(product.pricing)}</p></div></div></section>}
          {product.faq.length > 0 && <section id="faq"><h2>FAQ</h2><div className="product-faq-list">{product.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>}
        </div>

        {saleProduct ? <section className="product-buy-panel" id="buy"><div><h2>Ready to use {product.name}?</h2><p>{formatPrice(product.pricing)} · Gumroad securely handles payment and delivery.</p></div><div className="product-details-actions"><CheckoutButton checkoutUrl={product.links.checkoutUrl} className="product-action-primary">Buy Now</CheckoutButton><DemoAction demoUrl={product.links.demoUrl} checkoutUrl={product.links.checkoutUrl} productName={product.name} images={product.images} className="product-action-secondary" /></div></section> : <section className="product-buy-panel showcase-panel"><div><h2>Built by ARIX</h2><p>This is a showcase project. It is not available for sale or download.</p></div><DemoAction demoUrl={product.links.demoUrl} productName={product.name} images={product.images} className="product-action-secondary" /></section>}
      </div>
    </main>
  )
}

export default ProductDetails
