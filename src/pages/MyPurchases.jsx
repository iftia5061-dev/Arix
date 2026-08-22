import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/authStore'
import { createPurchaseDelivery } from '../services/purchaseApi'
import './MyPurchases.css'

function readableDate(value) {
  const date = value?.toDate?.()
  return date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date) : 'Processing'
}

function MyPurchases() {
  const { user, loading, loginWithGoogle } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [delivering, setDelivering] = useState('')

  useEffect(() => {
    if (!user) return undefined
    const purchases = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('paidAt', 'desc'))
    return onSnapshot(purchases, (snapshot) => {
      setOrders(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      setError('')
    }, (snapshotError) => {
      console.error('Purchase load failed:', snapshotError)
      setError('Your purchases could not be loaded right now.')
    })
  }, [user])

  const openDelivery = async (orderId) => {
    setDelivering(orderId)
    setError('')
    try {
      const delivery = await createPurchaseDelivery(orderId)
      window.location.assign(delivery.url)
    } catch (deliveryError) {
      console.error('Delivery request failed:', deliveryError)
      setError(deliveryError?.message || 'Access could not be confirmed. Please try again.')
    } finally {
      setDelivering('')
    }
  }

  if (loading) return <main className="purchases-page"><p>Loading account…</p></main>
  if (!user) return <main className="purchases-page purchases-gate"><h1>My Purchases</h1><p>Sign in with the account used before checkout to see verified purchases.</p><button onClick={loginWithGoogle}>Sign in with Google</button></main>

  return <main className="purchases-page"><div className="purchases-container"><header><p className="purchases-eyebrow">My Account</p><h1>My Purchases</h1><p>Only payments confirmed by Gumroad appear here. A payment success page never unlocks a product.</p></header>{error && <p className="purchases-message" role="alert">{error}</p>}{orders.length === 0 ? <section className="purchases-empty"><h2>No verified purchases yet</h2><p>After Gumroad confirms a payment, the product will appear here automatically.</p><Link to="/products">Browse Products</Link></section> : <section className="purchases-list">{orders.map((order) => <article className="purchase-card" key={order.id}>{order.coverImage && <img src={order.coverImage} alt="" />}<div className="purchase-content"><span className={`purchase-status ${order.status}`}>{order.status}</span><h2>{order.productName || 'ARIX product'}</h2><p>{order.currency} {(Number(order.amount || 0) / 100).toFixed(2)} · Paid {readableDate(order.paidAt)}</p><Link to={`/products/${order.productSlug}`}>View Product</Link></div><div className="purchase-action">{order.status === 'paid' ? <button onClick={() => openDelivery(order.id)} disabled={delivering === order.id}>{delivering === order.id ? 'Preparing…' : order.deliveryType === 'access' ? 'Open Access' : 'Download'}</button> : <span>Access unavailable</span>}</div></article>)}</section>}</div></main>
}

export default MyPurchases
