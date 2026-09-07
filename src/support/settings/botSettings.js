import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'

let cachedSettings = {
  aiEnabled: true,
  aiProvider: 'openai',
  aiModel: 'gpt-3.5-turbo',
  maxAICallsPerSession: 5,
  aiCooldownMs: 30000,
  emergencyDisable: false,
  maxQuestionsPerMinute: 10,
  spamThreshold: 3,
  offTopicThreshold: 2,
  aiOnlyForComplex: true,
  whatsappNumber: '8801910892757',
  showWhatsAppFallback: true,
  welcomeMessage: '👋 Hello! Welcome to OROFEX Support. How can we help you today?',
  botName: 'OROFEX AI'
}

let unsubscribe = null

export function initBotSettings() {
  if (unsubscribe) return // Already initialized

  try {
    const settingsRef = doc(db, 'supportSettings', 'main')
    unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        cachedSettings = {
          aiEnabled: data.aiEnabled ?? true,
          aiProvider: data.aiProvider ?? 'openai',
          aiModel: data.aiModel ?? 'gpt-3.5-turbo',
          maxAICallsPerSession: data.maxAICallsPerSession ?? 5,
          aiCooldownMs: data.aiCooldownMs ?? 30000,
          emergencyDisable: data.emergencyDisable ?? false,
          maxQuestionsPerMinute: data.maxQuestionsPerMinute ?? 10,
          spamThreshold: data.spamThreshold ?? 3,
          offTopicThreshold: data.offTopicThreshold ?? 2,
          aiOnlyForComplex: data.aiOnlyForComplex ?? true,
          whatsappNumber: data.whatsappNumber ?? '8801910892757',
          showWhatsAppFallback: data.showWhatsAppFallback ?? true,
          welcomeMessage: data.welcomeMessage ?? '👋 Hello! Welcome to OROFEX Support. How can we help you today?',
          botName: data.botName ?? 'OROFEX AI'
        }
      }
    }, (error) => {
      console.error('Error loading bot settings:', error)
    })
  } catch (error) {
    console.error('Error initializing bot settings:', error)
  }
}

export function cleanupBotSettings() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
}

export function getBotSettings() {
  return cachedSettings
}

export function isAIEnabled() {
  return cachedSettings.aiEnabled && !cachedSettings.emergencyDisable
}

export function getMaxAICalls() {
  return cachedSettings.maxAICallsPerSession
}

export function getAICooldown() {
  return cachedSettings.aiCooldownMs
}

export function getMaxQuestionsPerMinute() {
  return cachedSettings.maxQuestionsPerMinute
}

export function getSpamThreshold() {
  return cachedSettings.spamThreshold
}

export function getOffTopicThreshold() {
  return cachedSettings.offTopicThreshold
}

export function isAIOnlyForComplex() {
  return cachedSettings.aiOnlyForComplex
}

export function getAIProvider() {
  return cachedSettings.aiProvider
}

export function getAIModel() {
  return cachedSettings.aiModel
}

export function getWhatsAppNumber() {
  return cachedSettings.whatsappNumber
}

export function getShowWhatsAppFallback() {
  return cachedSettings.showWhatsAppFallback
}

export function getWelcomeMessage() {
  return cachedSettings.welcomeMessage
}

export function getBotName() {
  return cachedSettings.botName
}

export function updateCachedSettings(newSettings) {
  Object.assign(cachedSettings, newSettings)
}
