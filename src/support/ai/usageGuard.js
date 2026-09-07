import { getMaxAICalls, getAICooldown, isAIEnabled } from '../settings/botSettings'

export class UsageGuard {
  constructor() {
    this.aiCallCount = 0
    this.lastAICall = 0
  }

  canCallAI() {
    // Check if AI is enabled
    if (!isAIEnabled()) {
      return {
        allowed: false,
        reason: 'disabled',
        message: 'AI is currently disabled. Please use the menu options or contact our support team.'
      }
    }

    const now = Date.now()
    const timeSinceLastCall = now - this.lastAICall
    const cooldownMs = getAICooldown()

    // Check cooldown
    if (timeSinceLastCall < cooldownMs) {
      return {
        allowed: false,
        reason: 'cooldown',
        message: 'Please wait a moment before asking another question.'
      }
    }

    // Check max calls per session
    const maxCalls = getMaxAICalls()
    if (this.aiCallCount >= maxCalls) {
      return {
        allowed: false,
        reason: 'limit',
        message: 'You\'ve reached the maximum number of AI questions for this session. Please try again later or contact our support team.'
      }
    }

    return { allowed: true }
  }

  recordAICall() {
    this.aiCallCount++
    this.lastAICall = Date.now()
  }

  reset() {
    this.aiCallCount = 0
    this.lastAICall = 0
  }

  getRemainingCalls() {
    return getMaxAICalls() - this.aiCallCount
  }
}

export const usageGuard = new UsageGuard()
