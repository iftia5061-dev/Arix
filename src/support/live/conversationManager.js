import { doc, setDoc, getDoc, getDocs, updateDoc, onSnapshot, collection, query, where, orderBy, addDoc, serverTimestamp, arrayUnion, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { auth } from '../../firebase'

class ConversationManager {
  constructor() {
    this.currentConversationId = null
  }

  // Create a new conversation
  async createConversation(initialData = {}) {
    try {
      const user = auth.currentUser
      const conversationRef = await addDoc(collection(db, 'conversations'), {
        customerId: user?.uid || 'anonymous',
        customerEmail: user?.email || null,
        customerName: user?.displayName || 'Anonymous',
        status: 'active',
        mode: 'bot',
        topic: initialData.topic || 'General Support',
        assignedAdmin: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: initialData.message || '',
        messages: []
      })

      this.currentConversationId = conversationRef.id
      return { success: true, conversationId: conversationRef.id }
    } catch (error) {
      console.error('Error creating conversation:', error)
      return { success: false, error: error.message }
    }
  }

  // Get conversation by ID
  async getConversation(conversationId) {
    try {
      const docRef = doc(db, 'conversations', conversationId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { success: true, conversation: { id: docSnap.id, ...docSnap.data() } }
      } else {
        return { success: false, error: 'Conversation not found' }
      }
    } catch (error) {
      console.error('Error getting conversation:', error)
      return { success: false, error: error.message }
    }
  }

  // Update conversation
  async updateConversation(conversationId, updates) {
    try {
      const docRef = doc(db, 'conversations', conversationId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating conversation:', error)
      return { success: false, error: error.message }
    }
  }

  // Add message to conversation
  async addMessage(conversationId, message) {
    try {
      const docRef = doc(db, 'conversations', conversationId)

      // Use a random component alongside the timestamp so two messages
      // created in the same millisecond never get the same id.
      const newMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        senderId: message.senderId || 'anonymous',
        senderType: message.senderType, // 'customer', 'ai', 'admin', 'system'
        text: message.text,
        timestamp: new Date().toISOString(),
        read: false
      }

      // arrayUnion() appends atomically on Firestore's server —
      // no read-then-write, so two messages arriving at nearly the
      // same time can no longer overwrite each other.
      await updateDoc(docRef, {
        messages: arrayUnion(newMessage),
        lastMessage: message.text,
        updatedAt: serverTimestamp()
      })

      return { success: true, messageId: newMessage.id }
    } catch (error) {
      console.error('Error adding message:', error)
      return { success: false, error: error.message }
    }
  }

  // Listen to conversation updates (realtime)
  listenToConversation(conversationId, callback) {
    const docRef = doc(db, 'conversations', conversationId)
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() })
      }
    }, (error) => {
      console.error('Error listening to conversation:', error)
    })

    return unsubscribe
  }

  // Get all conversations for admin
  listenToAllConversations(callback) {
    const q = query(
      collection(db, 'conversations'),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(conversations)
    }, (error) => {
      console.error('Error listening to conversations:', error)
    })

    return unsubscribe
  }

  // Get customer's conversations
  async getCustomerConversations(customerId) {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('customerId', '==', customerId),
        orderBy('updatedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true, conversations }
    } catch (error) {
      console.error('Error getting customer conversations:', error)
      return { success: false, error: error.message }
    }
  }

  // Close conversation
  async closeConversation(conversationId) {
    return this.updateConversation(conversationId, {
      status: 'closed',
      mode: 'bot'
    })
  }

  // Request human handoff
  async requestHumanSupport(conversationId) {
    return this.updateConversation(conversationId, {
      mode: 'waiting-admin'
    })
  }

  // Admin joins conversation
  async adminJoinConversation(conversationId, adminId) {
    const result = await this.updateConversation(conversationId, {
      mode: 'human',
      assignedAdmin: adminId
    })
    
    // Send system message to notify user that admin has joined
    if (result.success) {
      await this.addMessage(conversationId, {
        senderId: 'system',
        senderType: 'system',
        text: '👨‍💼 A support agent has joined the conversation. You can now send your message!'
      })
    }
    
    return result
  }

  // Admin leaves conversation
  async adminLeaveConversation(conversationId) {
    const result = await this.updateConversation(conversationId, {
      mode: 'bot',
      assignedAdmin: null
    })
    
    // Send system message to notify user that admin has left
    if (result.success) {
      await this.addMessage(conversationId, {
        senderId: 'system',
        senderType: 'system',
        text: '⚡ The support agent has left the conversation. Returning to AI bot mode.'
      })
    }
    
    return result
  }

  // Delete conversation permanently
  async deleteConversation(conversationId) {
    try {
      const docRef = doc(db, 'conversations', conversationId)
      await deleteDoc(docRef)
      return { success: true }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      return { success: false, error: error.message }
    }
  }
}

export const conversationManager = new ConversationManager()
