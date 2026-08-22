import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { isPublicProduct, normalizeProduct } from '../data/productSchema'

export function usePublishedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const publishedProducts = query(collection(db, 'products'), where('visibility', '==', 'public'))
    const unsubscribe = onSnapshot(
      publishedProducts,
      (snapshot) => {
        const nextProducts = snapshot.docs
          .map((docItem) => normalizeProduct(docItem.data(), docItem.id))
          .filter(isPublicProduct)
          .sort((first, second) => Number(second.featured) - Number(first.featured) || first.name.localeCompare(second.name))
        setProducts(nextProducts)
        setError(null)
        setLoading(false)
      },
      (snapshotError) => {
        console.error('Could not load published products:', snapshotError)
        setError(snapshotError)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  return { products, loading, error }
}
