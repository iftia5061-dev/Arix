import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/authStore'
import { formatOrderPlanPrice } from '../data/pricingLookup'
import './UserDashboard.css'

function UserDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userOrders = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((order) => order.customerEmail === user.email)
      setOrders(userOrders)
      setLoading(false)
    }, (error) => {
      console.error('Could not load orders:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  if (!user) {
    return (
      <div className="user-dashboard">
        <div className="user-dashboard-container">
          <div className="user-auth-gate">
            <h1>Sign in to view your orders</h1>
            <p>Please sign in with your Google account to track your orders.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="user-dashboard">
      <div className="user-dashboard-container">
        <div className="user-dashboard-header">
          <h1>My Orders</h1>
          <p className="user-email">{user.email}</p>
        </div>

        {loading ? (
          <p className="user-loading">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="user-empty">
            <p>No orders yet.</p>
            <a href="/contact" className="user-cta-link">Place your first order →</a>
          </div>
        ) : (
          <div className="user-orders-list">
            {orders.map((order) => (
              <article key={order.id} className="user-order-card">
                <div className="user-order-header">
                  <div className="user-order-info">
                    <h3>{order.planName ? order.planName : 'Custom Quote'}</h3>
                    <p>{order.categoryLabel}</p>
                  </div>
                  <span className={`user-order-status user-order-status-${order.status || 'pending'}`}>
                    {order.status || 'Pending'}
                  </span>
                </div>

                <div className="user-order-details">
                  <div className="user-order-detail-item">
                    <span className="user-order-label">Price:</span>
                    <span className="user-order-value">{formatOrderPlanPrice(order)}</span>
                  </div>
                  <div className="user-order-detail-item">
                    <span className="user-order-label">Timeline:</span>
                    <span className="user-order-value">{order.timelineDays} days</span>
                  </div>
                  <div className="user-order-detail-item">
                    <span className="user-order-label">Delivery:</span>
                    <span className="user-order-value">{order.delivery || 'To be discussed'}</span>
                  </div>
                  <div className="user-order-detail-item">
                    <span className="user-order-label">Order ID:</span>
                    <span className="user-order-value">{order.id}</span>
                  </div>
                  <div className="user-order-detail-item">
                    <span className="user-order-label">Date:</span>
                    <span className="user-order-value">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                </div>

                <div className="user-order-description">
                  <span className="user-order-label">Project Description:</span>
                  <p>{order.roadmap}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboard