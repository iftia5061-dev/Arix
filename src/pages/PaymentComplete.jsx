import { Link } from 'react-router-dom'
import './MyPurchases.css'

function PaymentComplete() {
  return <main className="purchases-page purchases-gate"><h1>Payment processing</h1><p>Thanks for your order. ARIX will unlock your purchase only after Gumroad verifies the payment through our secure backend. This page does not grant access.</p><Link to="/my-purchases">Go to My Purchases</Link></main>
}

export default PaymentComplete
