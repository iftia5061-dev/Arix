import { conversationManager } from './conversationManager'
import { auth } from '../../firebase'

export class HandoffManager {
  constructor() {
    this.conversationId = null
    this.conversationState = 'bot' // 'bot' | 'waiting-admin' | 'human' | 'closed'
  }

  setConversationId(conversationId) {
    this.conversationId = conversationId
  }

  async requestHumanSupport() {
    if (!this.conversationId) {
      // Only create conversation if user is logged in
      if (!auth.currentUser) {
        return {
          success: false,
          message: 'Please login to connect with support agents.',
          state: 'bot'
        }
      }
      
      const result = await conversationManager.createConversation({
        topic: 'Support Request',
        message: 'Customer requested human support'
      })
      if (result.success) {
        this.conversationId = result.conversationId
      } else {
        return {
          success: false,
          message: 'Failed to create conversation. Please try again.',
          state: 'bot'
        }
      }
    }

    if (this.conversationId) {
      await conversationManager.requestHumanSupport(this.conversationId)
    }

    this.conversationState = 'waiting-admin'
    return {
      success: true,
      message: 'Requesting human support... Please wait while we connect you with a support agent.',
      state: 'waiting-admin'
    }
  }

  async adminJoin(adminId) {
    if (this.conversationId) {
      await conversationManager.adminJoinConversation(this.conversationId, adminId)
    }

    if (this.conversationState !== 'waiting-admin') {
      return {
        success: false,
        message: 'No pending handoff request.'
      }
    }

    this.conversationState = 'human'
    return {
      success: true,
      message: 'A support agent has joined the conversation.',
      state: 'human'
    }
  }

  async adminLeave() {
    if (this.conversationId) {
      await conversationManager.adminLeaveConversation(this.conversationId)
    }

    if (this.conversationState !== 'human') {
      return {
        success: false,
        message: 'No active conversation to end.'
      }
    }

    this.conversationState = 'bot'
    return {
      success: true,
      message: 'The support agent has left. Returning to bot mode.',
      state: 'bot'
    }
  }

  async closeConversation() {
    if (this.conversationId) {
      await conversationManager.closeConversation(this.conversationId)
    }

    this.conversationState = 'closed'
    return {
      success: true,
      message: 'Conversation closed.',
      state: 'closed'
    }
  }

  getConversationState() {
    return this.conversationState
  }

  isWaitingForAdmin() {
    return this.conversationState === 'waiting-admin'
  }

  isInHumanMode() {
    return this.conversationState === 'human'
  }

  isBotMode() {
    return this.conversationState === 'bot'
  }

  getHandoffInfo() {
    return {
      state: this.conversationState,
      conversationId: this.conversationId
    }
  }
}

export const handoffManager = new HandoffManager()
