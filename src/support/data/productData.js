import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase'

export async function getProductsByCategory(category) {
  try {
    const q = query(
      collection(db, 'products'),
      where('category', '==', category),
      where('status', '==', 'published'),
      where('visibility', '==', 'public')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getAllPublishedProducts() {
  try {
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'published'),
      where('visibility', '==', 'public')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching all products:', error)
    return []
  }
}

export async function getProductBySlug(slug) {
  try {
    const q = query(
      collection(db, 'products'),
      where('slug', '==', slug),
      where('status', '==', 'published'),
      where('visibility', '==', 'public')
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export function formatProductPrice(product) {
  if (!product.pricing || !product.pricing.amount) return 'Contact for pricing'
  const { amount, currency, type } = product.pricing
  const price = amount.toFixed(2)
  if (type === 'subscription') {
    return `${currency} ${price}/month`
  } else if (type === 'lifetime') {
    return `${currency} ${price} (lifetime)`
  }
  return `${currency} ${price}`
}

export function getCategoryProductsMenu(category) {
  const categoryMap = {
    'software': { label: 'Software Products', icon: '💻' },
    'saas': { label: 'SaaS Products', icon: '☁️' },
    'ai': { label: 'AI Tools', icon: '🤖' },
    'mobile-apps': { label: 'Mobile Apps', icon: '📱' },
    'tools': { label: 'Tools', icon: '🛠️' },
    'web-design': { label: 'Web Designs', icon: '🎨' },
  }

  return {
    id: `category-${category}`,
    label: categoryMap[category]?.label || category,
    icon: categoryMap[category]?.icon || '📦',
    parent: 'products',
    category
  }
}
