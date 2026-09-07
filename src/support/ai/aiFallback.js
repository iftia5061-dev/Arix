export function getFallbackResponse(errorType, error = null) {
  const fallbacks = {
    'api-error': {
      title: 'Service Unavailable',
      message: 'I\'m unable to answer this automatically right now. Would you like to contact our support team?',
      type: 'fallback',
      showHumanHandoff: true
    },
    'rate-limit': {
      title: 'Rate Limit',
      message: 'You\'ve reached the maximum number of AI questions. Please try again later or contact our support team.',
      type: 'fallback',
      showHumanHandoff: true
    },
    'timeout': {
      title: 'Request Timeout',
      message: 'The request took too long. Please try again or contact our support team directly.',
      type: 'fallback',
      showHumanHandoff: true
    },
    'network-error': {
      title: 'Connection Error',
      message: 'I\'m having trouble connecting. Please check your internet or contact our support team.',
      type: 'fallback',
      showHumanHandoff: true
    },
    'disabled': {
      title: 'AI Disabled',
      message: 'AI is currently disabled. Please use the menu options or contact our support team.',
      type: 'fallback',
      showHumanHandoff: true
    },
    'default': {
      title: 'Unable to Answer',
      message: 'I\'m unable to answer this automatically right now. Would you like to contact our support team?',
      type: 'fallback',
      showHumanHandoff: true
    }
  }

  return fallbacks[errorType] || fallbacks['default']
}

export function getHumanHandoffOptions() {
  return [
    { id: 'admin', label: '👨‍💼 Talk to Admin' },
    { id: 'whatsapp', label: '📱 WhatsApp' },
    { id: 'main', label: '🏠 Main Menu' }
  ]
}

export function formatErrorForDisplay(error) {
  // Never show raw API errors to users
  // Always use user-friendly messages
  if (!error) {
    return 'An unexpected error occurred. Please try again.'
  }

  // Check for specific error types
  if (error.message?.includes('429')) {
    return 'Too many requests. Please wait a moment.'
  }

  if (error.message?.includes('500')) {
    return 'Service temporarily unavailable. Please try again.'
  }

  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }

  // Default generic message
  return 'Something went wrong. Please try again or contact support.'
}
