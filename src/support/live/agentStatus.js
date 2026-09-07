import { doc, setDoc, getDoc, onSnapshot, serverTimestamp, collection, query, where, documentId, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import { auth } from '../../firebase'

export class AgentStatus {
  constructor() {
    this.status = 'offline' // 'online' | 'away' | 'offline'
    this.lastUpdated = Date.now()
    this.unsubscribe = null
  }

  async setStatus(newStatus) {
    const validStatuses = ['online', 'away', 'offline']
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        message: 'Invalid status. Must be online, away, or offline.'
      }
    }

    this.status = newStatus
    this.lastUpdated = Date.now()

    // Persist to Firestore for each admin
    const user = auth.currentUser
    if (user) {
      try {
        await setDoc(doc(db, 'supportSettings', `admin-status-${user.uid}`), {
          status: newStatus,
          lastUpdated: serverTimestamp(),
          adminId: user.uid
        }, { merge: true })
      } catch (error) {
        console.error('Error persisting admin status:', error)
      }
    }

    return {
      success: true,
      message: `Status changed to ${newStatus}.`,
      status: newStatus
    }
  }

  getStatus() {
    return this.status
  }

  isOnline() {
    return this.status === 'online'
  }

  isAway() {
    return this.status === 'away'
  }

  isOffline() {
    return this.status === 'offline'
  }

  isAvailable() {
    return this.status === 'online' || this.status === 'away'
  }

  getStatusInfo() {
    return {
      status: this.status,
      lastUpdated: this.lastUpdated,
      isAvailable: this.isAvailable()
    }
  }

  // Listen to admin status changes (for dashboard)
  listenToAdminStatus(adminId, callback) {
    if (this.unsubscribe) {
      this.unsubscribe()
    }

    const docRef = doc(db, 'supportSettings', `admin-status-${adminId}`)
    this.unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        this.status = data.status || 'offline'
        callback(data)
      }
    }, (error) => {
      console.error('Error listening to admin status:', error)
    })

    return this.unsubscribe
  }

  // Check if ANY admin (not just the current browser's local state) is
  // currently online or away, by querying every admin-status-* document.
  async checkAnyAdminAvailable() {
    try {
      const q = query(
        collection(db, 'supportSettings'),
        where(documentId(), '>=', 'admin-status-'),
        where(documentId(), '<', 'admin-status-\uf8ff')
      )
      const snapshot = await getDocs(q)

      return snapshot.docs.some((docSnap) => {
        const data = docSnap.data()
        return data.status === 'online' || data.status === 'away'
      })
    } catch (error) {
      console.error('Error checking admin availability:', error)
      // Fail safe: if we can't confirm anyone is online, treat as
      // unavailable so the customer gets the WhatsApp fallback
      // instead of waiting forever for a reply that may never come.
      return false
    }
  }

  // Live-subscribe to "is any admin online" — for the customer-facing UI.
  // Returns an unsubscribe function; does NOT touch this.unsubscribe,
  // so it won't conflict with listenToAdminStatus() used by the dashboard.
  listenToAnyAdminAvailable(callback) {
    const q = query(
      collection(db, 'supportSettings'),
      where(documentId(), '>=', 'admin-status-'),
      where(documentId(), '<', 'admin-status-\uf8ff')
    )

    return onSnapshot(q, (snapshot) => {
      const anyAvailable = snapshot.docs.some((docSnap) => {
        const data = docSnap.data()
        return data.status === 'online' || data.status === 'away'
      })
      callback(anyAvailable)
    }, (error) => {
      console.error('Error listening to admin availability:', error)
      callback(false)
    })
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }
}

export const agentStatus = new AgentStatus()
