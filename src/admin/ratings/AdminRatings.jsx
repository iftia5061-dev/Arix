import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/authStore'
import './AdminRatings.css'

function AdminRatings() {
  const { user, isAdmin } = useAuth()
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }

    const q = query(collection(db, 'ratings'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRatings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }, (error) => {
      console.error('Could not load ratings:', error)
      setMessage('Ratings could not be loaded.')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, isAdmin])

  const handleDelete = async (rating) => {
    if (!confirm('Delete this rating?')) return

    try {
      await deleteDoc(doc(db, 'ratings', rating.id))
      setMessage('Rating deleted successfully.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Delete error:', error)
      setMessage('Could not delete rating.')
    }
  }

  const filteredRatings = ratings.filter(r => {
    if (filter === 'all') return true
    if (filter === '5') return r.rating === 5
    if (filter === '4') return r.rating === 4
    if (filter === '3') return r.rating === 3
    if (filter === '2') return r.rating === 2
    if (filter === '1') return r.rating === 1
    if (filter === 'comments') return r.comment && r.comment.length > 0
    return true
  })

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : null

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
    percentage: ratings.length > 0 ? (ratings.filter(r => r.rating === star).length / ratings.length) * 100 : 0
  }))

  if (!user || !isAdmin) {
    return (
      <div className="admin-ratings-access-denied">
        <h1>Access Denied</h1>
        <p>Only admins can access this page.</p>
      </div>
    )
  }

  return (
    <div className="admin-ratings-page">
      <div className="admin-ratings-header">
        <div>
          <h1>Ratings</h1>
          <p>View and manage visitor ratings</p>
        </div>
        <div className="admin-nav">
          <a href="/admin" className="admin-nav-link">← Back to Dashboard</a>
          <a href="/admin/products" className="admin-nav-link">Products</a>
          <a href="/admin/orders" className="admin-nav-link">Orders</a>
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      <div className="admin-ratings-overview">
        <div className="admin-rating-summary">
          <div className="admin-rating-average">
            <span className="admin-rating-average-value">{averageRating || '—'}</span>
            <span className="admin-rating-average-label">Average Rating</span>
          </div>
          <div className="admin-rating-total">
            <span className="admin-rating-total-value">{ratings.length}</span>
            <span className="admin-rating-total-label">Total Ratings</span>
          </div>
        </div>

        <div className="admin-rating-distribution">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="admin-rating-bar">
              <span className="admin-rating-bar-label">{star} ★</span>
              <div className="admin-rating-bar-track">
                <div
                  className="admin-rating-bar-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="admin-rating-bar-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-ratings-controls">
        <div className="admin-filter-buttons">
          <button
            className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({ratings.length})
          </button>
          <button
            className={`admin-filter-btn ${filter === '5' ? 'active' : ''}`}
            onClick={() => setFilter('5')}
          >
            5 ★ ({ratings.filter(r => r.rating === 5).length})
          </button>
          <button
            className={`admin-filter-btn ${filter === '4' ? 'active' : ''}`}
            onClick={() => setFilter('4')}
          >
            4 ★ ({ratings.filter(r => r.rating === 4).length})
          </button>
          <button
            className={`admin-filter-btn ${filter === '3' ? 'active' : ''}`}
            onClick={() => setFilter('3')}
          >
            3 ★ ({ratings.filter(r => r.rating === 3).length})
          </button>
          <button
            className={`admin-filter-btn ${filter === '2' ? 'active' : ''}`}
            onClick={() => setFilter('2')}
          >
            2 ★ ({ratings.filter(r => r.rating === 2).length})
          </button>
          <button
            className={`admin-filter-btn ${filter === '1' ? 'active' : ''}`}
            onClick={() => setFilter('1')}
          >
            1 ★ ({ratings.filter(r => r.rating === 1).length})
          </button>
          <button
            className={`admin-filter-btn ${filter === 'comments' ? 'active' : ''}`}
            onClick={() => setFilter('comments')}
          >
            With Comments ({ratings.filter(r => r.comment && r.comment.length > 0).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading ratings...</div>
      ) : filteredRatings.length === 0 ? (
        <div className="admin-empty">
          {ratings.length === 0 ? 'No ratings yet.' : 'No ratings match your filter.'}
        </div>
      ) : (
        <div className="admin-ratings-list">
          {filteredRatings.map((rating) => (
            <article key={rating.id} className="admin-rating-card">
              <div className="admin-rating-card-header">
                <div className="admin-rating-stars">
                  {'★'.repeat(rating.rating)}
                  {'☆'.repeat(5 - rating.rating)}
                </div>
                <button
                  onClick={() => handleDelete(rating)}
                  className="admin-delete-btn"
                >
                  Delete
                </button>
              </div>

              {rating.comment && (
                <p className="admin-rating-comment">{rating.comment}</p>
              )}

              <div className="admin-rating-meta">
                <span className="admin-rating-page">{rating.page || 'Unknown page'}</span>
                <span className="admin-rating-date">
                  {rating.createdAt?.toDate ? rating.createdAt.toDate().toLocaleString() : 'Just now'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminRatings
