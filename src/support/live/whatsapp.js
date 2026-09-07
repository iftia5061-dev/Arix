const WHATSAPP_NUMBER = '8801910892757'
const WHATSAPP_URL = 'https://wa.me'

export function getWhatsAppURL(message = '') {
  const url = new URL(`${WHATSAPP_URL}/${WHATSAPP_NUMBER}`)

  if (message) {
    url.searchParams.append('text', message)
  }

  return url.toString()
}

export function getPrefilledSupportMessage(userContext = {}) {
  const { currentTopic, lastQuestion, conversationState } = userContext

  let message = 'Hello OROFEX,\n\n'

  if (conversationState === 'waiting-admin') {
    message += 'I was waiting for a support agent but wanted to reach out on WhatsApp instead.\n\n'
  }

  if (currentTopic) {
    message += `Topic: ${currentTopic}\n\n`
  }

  if (lastQuestion) {
    message += `Question: ${lastQuestion}\n\n`
  }

  message += 'I need help with a product/service. Please assist me.'

  return message
}

export function openWhatsApp(message = '') {
  const url = getWhatsAppURL(message)
  window.open(url, '_blank')
}

export function getWhatsAppButtonLabel() {
  return '📱 WhatsApp'
}

export function getWhatsAppDescription() {
  return 'Contact us on WhatsApp for quick support'
}

export function shouldShowWhatsAppFallback(adminStatus, conversationState) {
  // Show WhatsApp if admin is offline
  if (adminStatus === 'offline') {
    return true
  }

  // Show WhatsApp if waiting for admin too long
  if (conversationState === 'waiting-admin') {
    return true
  }

  return false
}
