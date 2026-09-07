import { isOROFEXRelated, getOffTopicResponse } from './scopeGuard'
import { usageGuard } from './usageGuard'
import { COMPANY_CONTEXT } from './companyContext'
import { shouldUseAI, getComplexityLevel } from './complexityCheck'
import { abuseProtection } from './abuseProtection'
import { getAIProvider, getAIModel } from '../settings/botSettings'

// A per-browser-tab session id, generated once when this module loads.
// Sent to the server so it can apply per-session rate limits.
// (Resets on full page reload — same lifetime as the in-memory usage guard below.)
function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2)
}

const SESSION_ID = generateSessionId()

export async function callAI(question) {
  // Check complexity first - only use AI for complex questions
  if (!shouldUseAI(question)) {
    return {
      success: false,
      response: {
        title: 'Rule-based Response',
        message: 'This question can be answered using our predefined responses. Please use the menu options or ask a more specific question.',
        type: 'rule-fallback'
      },
      error: null
    }
  }

  // Check scope first
  if (!isOROFEXRelated(question)) {
    const isOffTopic = true
    abuseProtection.recordQuestion(question, isOffTopic)

    // Check for off-topic abuse
    if (abuseProtection.isOffTopicAbuse()) {
      return {
        success: false,
        response: abuseProtection.getOffTopicAbuseResponse(),
        error: null
      }
    }

    return {
      success: false,
      response: getOffTopicResponse(),
      error: null
    }
  }

  // Check abuse protection
  if (abuseProtection.isSpamming(question)) {
    return {
      success: false,
      response: abuseProtection.getSpamResponse(),
      error: null
    }
  }

  if (abuseProtection.isRateLimited()) {
    return {
      success: false,
      response: abuseProtection.getRateLimitResponse(),
      error: null
    }
  }

  // Check usage limits (client-side, quick feedback)
  const usageCheck = usageGuard.canCallAI()
  if (!usageCheck.allowed) {
    return {
      success: false,
      response: {
        title: 'AI Limit Reached',
        message: usageCheck.message,
        type: 'limit'
      },
      error: null
    }
  }

  // Record the question and AI call
  abuseProtection.recordQuestion(question, false)
  usageGuard.recordAICall()

  // Call real AI API through Vercel server-side endpoint
  // (the server applies its own independent rate/session limits too)
  try {
    const aiProvider = getAIProvider()
    const aiModel = getAIModel()
    const aiResponse = await callRealAI(question, COMPANY_CONTEXT, aiProvider, aiModel)

    return {
      success: true,
      response: aiResponse,
      error: null
    }
  } catch (error) {
    console.error('AI API error:', error)

    // Fallback to rule-based response if AI fails
    return {
      success: false,
      response: {
        title: 'AI Unavailable',
        message: 'I\'m unable to answer this automatically right now. Please use the menu options or contact our support team.',
        type: 'ai-fallback'
      },
      error: null
    }
  }
}

// Call real AI API through Vercel server-side endpoint
async function callRealAI(question, context, provider, model) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question,
      context,
      provider,
      model,
      sessionId: SESSION_ID
    })
  })

  if (!response.ok) {
    // Try to read the server's message so the fallback text isn't generic
    let serverMessage = null
    try {
      const errorData = await response.json()
      serverMessage = errorData?.message || null
    } catch {
      // ignore parse errors, fall through to generic error
    }

    const error = new Error(`AI API error: ${response.status}`)
    error.userMessage = serverMessage
    throw error
  }

  const data = await response.json()
  return data
}

export function getAIContext() {
  return COMPANY_CONTEXT
}

export function getRemainingAICalls() {
  return usageGuard.getRemainingCalls()
}

export function getComplexityInfo(text) {
  return {
    level: getComplexityLevel(text),
    shouldUseAI: shouldUseAI(text)
  }
}