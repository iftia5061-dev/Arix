import { useState } from 'react'
import { useAuth } from '../../context/authStore'
import { createCheckoutSession } from '../../services/purchaseApi'

function CheckoutButton({ productId, className = '', children = 'Buy Now' }) {
  const { user, loginWithGoogle } = useAuth()
  const [busy, setBusy] = useState(false)

  const beginCheckout = async () => {
    setBusy(true)
    try {
      const activeUser = user || (await loginWithGoogle()).user
      if (!activeUser) throw new Error('Sign in is required before checkout.')
      const checkoutUrl = await createCheckoutSession(productId)
      window.location.assign(checkoutUrl)
    } catch (error) {
      console.error('Checkout start failed:', error)
      window.alert(error?.message || 'Checkout could not be started. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <button type="button" className={className} onClick={beginCheckout} disabled={busy}>{busy ? 'Opening checkout…' : children}</button>
}

export default CheckoutButton
