import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/authStore'
import { formatOrderPlanPrice } from '../../data/pricingLookup'
import './AdminOrders.css'

function AdminOrders() {
  const { user, isAdmin } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }, (error) => {
      console.error('Could not load orders:', error)
      setMessage('Orders could not be loaded.')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, isAdmin])

  const handleStatusChange = async (order, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      })
      setMessage(`Order status updated to "${newStatus}".`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Status update error:', error)
      setMessage('Could not update status.')
    }
  }

  const handleDelete = async (order) => {
    if (!confirm(`Delete order from "${order.customerName}"?`)) return

    try {
      await deleteDoc(doc(db, 'orders', order.id))
      setMessage('Order deleted successfully.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Delete error:', error)
      setMessage('Could not delete order.')
    }
  }

  const filteredOrders = orders.filter(o =>
    o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
    o.planName?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'in-progress': return '#22d3ee'
      case 'completed': return '#22c55e'
      case 'cancelled': return '#ef4444'
      default: return '#94a3b8'
    }
  }

  if (!user || !isAdmin) {
    return (
      <div className="admin-orders-access-denied">
        <h1>Access Denied</h1>
        <p>Only admins can access this page.</p>
      </div>
    )
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <div>
          <h1>Orders</h1>
          <p>Manage all customer orders</p>
        </div>
        <div className="admin-nav">
          <a href="/admin" className="admin-nav-link">← Back to Dashboard</a>
          <a href="/admin/products" className="admin-nav-link">Products</a>
          <a href="/admin/ratings" className="admin-nav-link">Ratings</a>
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      <div className="admin-orders-controls">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search by name, email, plan, or Order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-stats">
          <span className="admin-stat-item">Total: {orders.length}</span>
          <span className="admin-stat-item">Pending: {orders.filter(o => o.status === 'pending').length}</span>
          <span className="admin-stat-item">In Progress: {orders.filter(o => o.status === 'in-progress').length}</span>
          <span className="admin-stat-item">Completed: {orders.filter(o => o.status === 'completed').length}</span>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-empty">
          {orders.length === 0 ? 'No orders yet.' : 'No orders match your search.'}
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map((order) => (
            <article key={order.id} className="admin-order-card">
              <div className="admin-order-card-header">
                <div className="admin-order-customer">
                  <h3>{order.customerName || 'Unnamed Customer'}</h3>
                  <p>{order.customerEmail || 'No email'}</p>
                </div>
                <div className="admin-order-status">
                  <select
                    className="admin-status-select"
                    value={order.status || 'pending'}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    style={{ borderColor: getStatusColor(order.status) }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="admin-order-card-body">
                <div className="admin-order-details">
                  <div className="admin-order-detail-item">
                    <span className="admin-order-detail-label">Plan:</span>
                    <span className="admin-order-detail-value">
                      {order.planName ? `${order.categoryLabel} · ${order.planName}` : `${order.categoryLabel || 'Custom project'} · Custom quote`}
                    </span>
                  </div>
                  <div className="admin-order-detail-item">
                    <span className="admin-order-detail-label">Price:</span>
                    <span className="admin-order-detail-value">{formatOrderPlanPrice(order)}</span>
                  </div>
                  <div className="admin-order-detail-item">
                    <span className="admin-order-detail-label">Timeline:</span>
                    <span className="admin-order-detail-value">{order.timelineDays || '—'} days</span>
                  </div>
                  <div className="admin-order-detail-item">
                    <span className="admin-order-detail-label">Date:</span>
                    <span className="admin-order-detail-value">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <div className="admin-order-detail-item">
                    <span className="admin-order-detail-label">Order ID:</span>
                    <span className="admin-order-detail-value">
                      {order.orderNumber ? `ORD-${order.orderNumber}` : order.id}
                    </span>
                  </div>
                </div>

                {order.roadmap && (
                  <div className="admin-order-roadmap">
                    <h4>Roadmap</h4>
                    <p>{order.roadmap}</p>
                  </div>
                )}
              </div>

              <div className="admin-order-card-footer">
                <button
                  onClick={() => handleDelete(order)}
                  className="admin-delete-btn"
                >
                  Delete Order
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminOrders
