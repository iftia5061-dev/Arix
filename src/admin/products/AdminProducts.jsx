import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/authStore'
import { getProductReadiness, formatPrice } from '../../data/productSchema'
import './AdminProducts.css'

function AdminProducts() {
  const { user, isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }, (error) => {
      console.error('Could not load products:', error)
      setMessage('Products could not be loaded.')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, isAdmin])

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"?`)) return

    try {
      await deleteDoc(doc(db, 'products', product.id))
      setMessage('Product deleted successfully.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Delete error:', error)
      setMessage('Could not delete product.')
    }
  }

  const handleStatusChange = async (product, newStatus) => {
    try {
      await updateDoc(doc(db, 'products', product.id), { status: newStatus })
      setMessage(`Product status updated to "${newStatus}".`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Status update error:', error)
      setMessage('Could not update status.')
    }
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.slug?.toLowerCase().includes(search.toLowerCase())
  )

  if (!user || !isAdmin) {
    return (
      <div className="admin-products-access-denied">
        <h1>Access Denied</h1>
        <p>Only admins can access this page.</p>
      </div>
    )
  }

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <div>
          <h1>Products</h1>
          <p>Manage all your products and services</p>
        </div>
        <div className="admin-nav">
          <a href="/admin" className="admin-nav-link">← Back to Dashboard</a>
          <a href="/admin/orders" className="admin-nav-link">Orders</a>
          <a href="/admin/ratings" className="admin-nav-link">Ratings</a>
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      <div className="admin-products-controls">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search products by name, category, or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-stats">
          <span className="admin-stat-item">Total: {products.length}</span>
          <span className="admin-stat-item">Published: {products.filter(p => p.status === 'published').length}</span>
          <span className="admin-stat-item">Draft: {products.filter(p => p.status === 'draft').length}</span>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-empty">
          {products.length === 0 ? 'No products yet.' : 'No products match your search.'}
        </div>
      ) : (
        <div className="admin-products-grid">
          {filteredProducts.map((product) => {
            const readiness = getProductReadiness(product)
            return (
              <article key={product.id} className="admin-product-card">
                <div className="admin-product-card-image">
                  {product.coverImage ? (
                    <img src={product.coverImage} alt={product.name} />
                  ) : (
                    <span>{product.name?.slice(0, 2).toUpperCase() || 'PR'}</span>
                  )}
                </div>
                <div className="admin-product-card-content">
                  <div className="admin-product-card-header">
                    <h3>{product.name || 'Untitled Product'}</h3>
                    <select
                      className="admin-status-select"
                      value={product.status || 'draft'}
                      onChange={(e) => handleStatusChange(product, e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <p className="admin-product-card-category">
                    <span className={`admin-status-badge ${product.status}`}>{product.status}</span>
                    {product.category && ` · ${product.category}`}
                  </p>
                  {product.productType === 'sale' && (
                    <p className="admin-product-card-price">{formatPrice(product.pricing)}</p>
                  )}
                  {product.shortDescription && (
                    <p className="admin-product-card-description">{product.shortDescription}</p>
                  )}
                  {product.status === 'published' && !readiness.ready && (
                    <p className="admin-product-card-warning">
                      Not public: {readiness.missing.join(', ')}
                    </p>
                  )}
                  <div className="admin-product-card-footer">
                    <a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer" className="admin-view-link">
                      View →
                    </a>
                    <a href={`/admin?edit=${product.id}`} className="admin-edit-link">
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(product)}
                      className="admin-delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminProducts
