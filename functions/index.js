const crypto = require('crypto')
const admin = require('firebase-admin')
const { HttpsError, onCall } = require('firebase-functions/v2/https')

admin.initializeApp()

const db = admin.firestore()
const REGION = 'asia-southeast1'
const checkoutTokenField = 'arix_checkout_token'

function valueAsString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isWebUrl(value) {
  try {
    const url = new URL(valueAsString(value))
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function assertAuthenticated(request) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Sign in is required.')
}

function validSaleProduct(product) {
  const pricing = product?.pricing
  return product?.status === 'published'
    && product?.productType === 'sale'
    && isWebUrl(product?.links?.checkoutUrl)
    && valueAsString(product?.gumroad?.productId)
    && Number.isInteger(pricing?.amount)
    && pricing.amount > 0
    && /^[A-Z]{3}$/.test(valueAsString(pricing?.currency).toUpperCase())
}

exports.createCheckoutSession = onCall({ region: REGION }, async (request) => {
  assertAuthenticated(request)
  const productId = valueAsString(request.data?.productId)
  if (!productId || productId.length > 160) throw new HttpsError('invalid-argument', 'A valid product is required.')

  const productSnapshot = await db.collection('products').doc(productId).get()
  if (!productSnapshot.exists || !validSaleProduct(productSnapshot.data())) throw new HttpsError('failed-precondition', 'This product is not available for checkout.')
  const product = productSnapshot.data()
  const deliverySnapshot = await db.collection('productAssets').doc(productId).get()
  const delivery = deliverySnapshot.data() || {}
  if ((delivery.deliveryType === 'access' && !isWebUrl(delivery.accessUrl)) || (delivery.deliveryType !== 'access' && !valueAsString(delivery.storagePath))) {
    throw new HttpsError('failed-precondition', 'This product is not ready for delivery.')
  }

  const sessionId = crypto.randomBytes(32).toString('base64url')
  const now = admin.firestore.Timestamp.now()
  const expiresAt = admin.firestore.Timestamp.fromMillis(now.toMillis() + 60 * 60 * 1000)
  await db.collection('orders').doc(sessionId).create({
    userId: request.auth.uid,
    productId,
    productName: valueAsString(product.name),
    productSlug: valueAsString(product.slug),
    coverImage: valueAsString(product.coverImage),
    amount: product.pricing.amount,
    currency: valueAsString(product.pricing.currency).toUpperCase(),
    pricingType: valueAsString(product.pricing.type),
    gumroadProductId: valueAsString(product.gumroad.productId),
    paymentProvider: 'gumroad',
    transactionId: null,
    status: 'pending',
    deliveryType: delivery.deliveryType === 'access' ? 'access' : 'download',
    createdAt: now,
    expiresAt,
  })

  const checkoutUrl = new URL(product.links.checkoutUrl)
  // Create this exact optional text field in every Gumroad sale product. The
  // unguessable one-use value binds a provider-confirmed payment to this user.
  checkoutUrl.searchParams.set(checkoutTokenField, sessionId)
  return { checkoutUrl: checkoutUrl.toString() }
})

exports.createPurchaseDelivery = onCall({ region: REGION }, async (request) => {
  assertAuthenticated(request)
  const orderId = valueAsString(request.data?.orderId)
  if (!orderId || orderId.length > 200) throw new HttpsError('invalid-argument', 'A valid order is required.')
  const orderSnapshot = await db.collection('orders').doc(orderId).get()
  if (!orderSnapshot.exists) throw new HttpsError('not-found', 'Purchase not found.')
  const order = orderSnapshot.data()
  if (order.userId !== request.auth.uid) throw new HttpsError('permission-denied', 'This purchase belongs to another account.')
  if (order.status !== 'paid') throw new HttpsError('failed-precondition', 'Payment has not been confirmed.')

  const assetSnapshot = await db.collection('productAssets').doc(order.productId).get()
  const asset = assetSnapshot.data()
  if (!asset) throw new HttpsError('not-found', 'Product delivery is not configured.')
  if (asset.deliveryType === 'access') {
    if (!isWebUrl(asset.accessUrl)) throw new HttpsError('failed-precondition', 'Product access is not configured.')
    return { url: asset.accessUrl, type: 'access' }
  }
  const storagePath = valueAsString(asset.storagePath).replace(/^\/+/, '')
  if (!storagePath || storagePath.includes('..')) throw new HttpsError('failed-precondition', 'Product file is not configured.')
  const filename = valueAsString(asset.releaseName).replace(/[\r\n"\\]/g, '') || storagePath.split('/').pop()
  try {
    const [url] = await admin.storage().bucket().file(storagePath).getSignedUrl({
      version: 'v4', action: 'read', expires: Date.now() + 15 * 60 * 1000,
      responseDisposition: `attachment; filename="${filename}"`,
    })
    return { url, type: 'download', expiresInSeconds: 900 }
  } catch (error) {
    console.error('Could not issue private download link:', error.message)
    throw new HttpsError('internal', 'The download link could not be prepared.')
  }
})
