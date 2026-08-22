import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyB15F5r4B70bDHvl9RveQG5EfQwpXMh2G8",
  authDomain: "arix-website.firebaseapp.com",
  databaseURL: "https://arix-website-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "arix-website",
  storageBucket: "arix-website.firebasestorage.app",
  messagingSenderId: "625223930436",
  appId: "1:625223930436:web:73c1bc45bc2280c0bfa211",
  measurementId: "G-8CEWR1HR5K"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})
export const db = getFirestore(app)
// Keep callable payment operations in the same region as the Functions backend.
export const functions = getFunctions(app, 'asia-southeast1')
