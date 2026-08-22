import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'
import { AuthContext } from './authStore'

const EMAILJS_SERVICE_ID = 'service_6d3j3eg'
const EMAILJS_WELCOME_TEMPLATE_ID = 'template_reg7d8x'
const EMAILJS_PUBLIC_KEY = 'SKa-nGZ4RnuGbNj3D'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function saveUserToFirestore(firebaseUser) {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const existingUser = await getDoc(userRef)
      const isNewUser = !existingUser.exists()

      await setDoc(
        userRef,
        {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          lastLogin: serverTimestamp(),
          ...(isNewUser && { createdAt: serverTimestamp() }),
        },
        { merge: true }
      )

      return isNewUser
    } catch (firestoreError) {
      console.error('Firestore save error:', firestoreError)
      return false
    }
  }

  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    const isNewUser = await saveUserToFirestore(result.user)

    if (isNewUser) {
      sendWelcomeEmail(result.user)
    }

    return { user: result.user, isNewUser }
  }

  async function sendWelcomeEmail(firebaseUser) {
    try {
      const { default: emailjs } = await import('@emailjs/browser')
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_WELCOME_TEMPLATE_ID,
        {
          to_name: firebaseUser.displayName,
          to_email: firebaseUser.email,
        },
        EMAILJS_PUBLIC_KEY
      )
    } catch (error) {
      console.error('Welcome email error:', error)
    }
  }

  async function logout() {
    await signOut(auth)
  }

  const value = { user, loading, loginWithGoogle, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
