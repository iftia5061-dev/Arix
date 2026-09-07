// Vercel API route for AI - Server-side AI API protection
// This endpoint calls the AI provider and keeps the API key secure

import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

// Reuse the same PUBLIC Firebase web config used on the frontend.
// This is not a secret — Firebase web API keys are safe to include here.
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

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)

// ---- In-memory protection state (best-effort; resets on cold start) ----
const sessionState = new Map() // sessionId -> { count, lastCallTime, windowStart }
const GLOBAL_WINDOW_MS = 60 * 1000 // 1 minute
let globalCallTimestamps = []

const MAX_QUESTION_LENGTH = 800
const SESSION_MAX_CALLS = 15          // hard ceiling per session, regardless of owner setting
const SESSION_COOLDOWN_MS = 8000      // minimum gap between two calls from the same session
const GLOBAL_MAX_CALLS_PER_MINUTE = 60 // emergency circuit breaker for the whole server

function cleanupSession(entry, now) {
  // Reset the session's counters if it has been idle for a long time
  if (now - entry.lastCallTime > 30 * 60 * 1000) {
    entry.count = 0
  }
  return entry
}

function checkSessionLimit(sessionId) {
  const now = Date.now()
  let entry = sessionState.get(sessionId)

  if (!entry) {
    entry = { count: 0, lastCallTime: 0 }
  }
  entry = cleanupSession(entry, now)

  if (now - entry.lastCallTime < SESSION_COOLDOWN_MS) {
    return { allowed: false, reason: 'cooldown' }
  }

  if (entry.count >= SESSION_MAX_CALLS) {
    return { allowed: false, reason: 'session-limit' }
  }

  entry.count += 1
  entry.lastCallTime = now
  sessionState.set(sessionId, entry)

  // Keep the map from growing forever
  if (sessionState.size > 5000) {
    const oldestKey = sessionState.keys().next().value
    sessionState.delete(oldestKey)
  }

  return { allowed: true }
}

function checkGlobalLimit() {
  const now = Date.now()
  globalCallTimestamps = globalCallTimestamps.filter(t => now - t < GLOBAL_WINDOW_MS)

  if (globalCallTimestamps.length >= GLOBAL_MAX_CALLS_PER_MINUTE) {
    return false
  }

  globalCallTimestamps.push(now)
  return true
}

async function getServerSideAISettings() {
  try {
    const settingsRef = doc(db, 'supportSettings', 'main')
    const snap = await getDoc(settingsRef)

    if (!snap.exists()) {
      return { aiEnabled: true, emergencyDisable: false }
    }

    const data = snap.data()
    return {
      aiEnabled: data.aiEnabled ?? true,
      emergencyDisable: data.emergencyDisable ?? false
    }
  } catch (error) {
    console.error('Error loading AI settings server-side:', error)
    // Fail safe: if we can't confirm settings, don't block legitimate traffic,
    // but this is logged so it can be investigated.
    return { aiEnabled: true, emergencyDisable: false }
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { question, context, provider, model, sessionId } = req.body

    // Validate input
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid question' })
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({
        error: 'Question too long',
        message: 'Please ask a shorter question.'
      })
    }

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 8 || sessionId.length > 128) {
      return res.status(400).json({ error: 'Missing or invalid session identifier' })
    }

    // Check owner's AI enabled / emergency-off switch (server-side, cannot be bypassed)
    const settings = await getServerSideAISettings()
    if (!settings.aiEnabled || settings.emergencyDisable) {
      return res.status(503).json({
        error: 'AI disabled',
        message: 'AI support is temporarily unavailable. Please use the menu options or contact our support team.'
      })
    }

    // Global emergency circuit breaker
    if (!checkGlobalLimit()) {
      return res.status(429).json({
        error: 'Server busy',
        message: 'Our AI support is experiencing high demand right now. Please try again in a moment or contact our support team.'
      })
    }

    // Per-session rate limit / cooldown
    const sessionCheck = checkSessionLimit(sessionId)
    if (!sessionCheck.allowed) {
      const message = sessionCheck.reason === 'cooldown'
        ? 'Please wait a few seconds before asking another question.'
        : 'You\'ve reached the maximum number of AI questions for this session. Please contact our support team for further help.'

      return res.status(429).json({
        error: sessionCheck.reason,
        message
      })
    }

    // Use provider from request or environment
    const aiProvider = provider || process.env.AI_PROVIDER || 'openai'
    const aiModel = model || process.env.AI_MODEL || (aiProvider === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-haiku-20240307')

    // Get API key based on provider
    let apiKey
    if (aiProvider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY
    } else if (aiProvider === 'anthropic') {
      apiKey = process.env.ANTHROPIC_API_KEY
    } else if (aiProvider === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'AI service not configured',
        message: `Please configure ${aiProvider.toUpperCase()}_API_KEY in environment variables`
      })
    }

    let aiResponse

    if (aiProvider === 'openai') {
      aiResponse = await callOpenAI(question, context, apiKey, aiModel)
    } else if (aiProvider === 'anthropic') {
      aiResponse = await callAnthropic(question, context, apiKey, aiModel)
    } else if (aiProvider === 'gemini') {
      aiResponse = await callGemini(question, context, apiKey, aiModel)
    } else {
      return res.status(400).json({ error: 'Invalid AI provider' })
    }

    return res.status(200).json(aiResponse)

  } catch (error) {
    console.error('AI API error:', error)
    return res.status(500).json({
      error: 'AI service error',
      message: 'Unable to process your request at this time'
    })
  }
}

// OpenAI API call
async function callOpenAI(question, context, apiKey, model) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: context || 'You are a helpful customer support assistant for OROFEX.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    title: 'AI Response',
    message: data.choices[0].message.content,
    type: 'ai'
  }
}

// Anthropic API call
async function callAnthropic(question, context, apiKey, model) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `${context || 'You are a helpful customer support assistant for OROFEX.'}\n\nQuestion: ${question}`
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    title: 'AI Response',
    message: data.content[0].text,
    type: 'ai'
  }
}

// Google Gemini API call
async function callGemini(question, context, apiKey, model) {
  const geminiModel = model || 'gemini-2.5-flash'

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            { text: context || 'You are a helpful customer support assistant for OROFEX.' }
          ]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: question }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7
        }
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const message = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!message) {
    throw new Error('Gemini API returned an empty response')
  }

  return {
    title: 'AI Response',
    message,
    type: 'ai'
  }
}