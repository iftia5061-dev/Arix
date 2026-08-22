import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'

const createCheckout = httpsCallable(functions, 'createCheckoutSession')
const createDelivery = httpsCallable(functions, 'createPurchaseDelivery')

export async function createCheckoutSession(productId) {
  const result = await createCheckout({ productId })
  if (!result.data?.checkoutUrl) throw new Error('Checkout could not be started.')
  return result.data.checkoutUrl
}

export async function createPurchaseDelivery(orderId) {
  const result = await createDelivery({ orderId })
  if (!result.data?.url) throw new Error('Your delivery link could not be created.')
  return result.data
}
