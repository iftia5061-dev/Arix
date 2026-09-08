import { SUPPORT_RESPONSES } from '../data/supportResponses'
import { MAIN_MENU_OPTIONS, SERVICES_MENU, PRODUCTS_MENU, PRICING_MENU, ORDER_SUPPORT_MENU } from '../data/botMenus'
import { getProductsByCategory, formatProductPrice } from '../data/productData'
import { callAI, getComplexityInfo } from '../ai/aiRouter'
import { handoffManager } from '../live/handoff'
import { agentStatus } from '../live/agentStatus'
import { getPrefilledSupportMessage, getWhatsAppURL, openWhatsApp } from '../live/whatsapp'

// Language normalization function
function normalizeText(text) {
  if (!text) return ''
  
  let normalized = text.toLowerCase().trim()
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ')
  
  // Remove common punctuation
  normalized = normalized.replace(/[?!.,;:]/g, '')

  // Real Bangla (Unicode) keyword mapping — checked BEFORE Banglish
  const banglaMappings = {
    'দাম': 'price',
    'কত': 'how much',
    'কতো': 'how much',
    'কিনব': 'buy',
    'কিনবো': 'buy',
    'কেনা': 'buy',
    'দরকার': 'need',
    'পেমেন্ট': 'payment',
    'টাকা': 'price',
    'সাপোর্ট': 'support',
    'সহায়তা': 'support',
    'সমস্যা': 'problem',
    'পণ্য': 'product',
    'প্রোডাক্ট': 'product',
    'সার্ভিস': 'service',
    'সেবা': 'service',
    'ডাউনলোড': 'download',
    'যোগাযোগ': 'contact',
    'প্রশ্ন': 'question',
    'কিভাবে': 'how',
    'কীভাবে': 'how',
    'আছে': 'have',
    'চাই': 'want',
    'ওয়েবসাইট': 'website',
    'সফটওয়্যার': 'software',
    'কাস্টম': 'custom',
    'অর্ডার': 'order',
  }

  // Apply Bangla mappings first (longer/more specific keys first avoids partial overlaps)
  Object.keys(banglaMappings)
    .sort((a, b) => b.length - a.length)
    .forEach(key => {
      normalized = normalized.split(key).join(banglaMappings[key])
    })

  // Banglish variations mapping
  const banglishMappings = {
    'dam': 'price',
    'koto': 'how much',
    'kache': 'get',
    'pabe': 'get',
    'kinbo': 'buy',
    'kine': 'buy',
    'puron': 'about',
    'bivaron': 'support',
    'korate': 'make',
    'kora': 'make',
    'chai': 'want',
    'chao': 'want',
    'ache': 'have',
    'dorkar': 'need',
    'kivabe': 'how',
    'khuj': 'want',
    'taka': 'price',
    'bebohar': 'use',
    'download': 'download',
    'dawnload': 'download',
    'pay': 'payment',
    'peyment': 'payment',
    'support': 'support',
    'shaport': 'support',
    'help': 'help',
    'hlp': 'help',
    'service': 'service',
    'sharba': 'service',
    'product': 'product',
    'feature': 'feature',
    'fitur': 'feature',
    'web': 'web',
    'website': 'website',
    'software': 'software',
    'saftwar': 'software',
    'app': 'app',
    'mobile': 'mobile',
    'ai': 'ai',
    'design': 'design',
    'dijain': 'design',
    'custom': 'custom',
    'order': 'order',
    'contact': 'contact',
    'kontact': 'contact',
    'faq': 'faq',
    'question': 'question',
    'shongkkha': 'question',
  }
  
  // Apply Banglish mappings
  Object.keys(banglishMappings).forEach(key => {
    const regex = new RegExp(key, 'gi')
    normalized = normalized.replace(regex, banglishMappings[key])
  })
  
  return normalized
}

// Intent detection with language support
function detectIntent(text) {
  const normalized = normalizeText(text)
  
  // Pricing intent
  if (normalized.includes('price') || normalized.includes('pricing') || normalized.includes('cost') || normalized.includes('how much') || normalized.includes('koto taka') || normalized.includes('dam koto')) {
    return 'pricing'
  }
  
  // Product intent
  if (normalized.includes('product') || normalized.includes('ki product') || normalized.includes('software') || normalized.includes('saas') || normalized.includes('ai tool')) {
    return 'products'
  }
  
  // Service intent
  if (normalized.includes('service') || normalized.includes('sharba') || normalized.includes('service') || normalized.includes('design') || normalized.includes('development')) {
    return 'services'
  }
  
  // Download intent
  if (normalized.includes('download') || normalized.includes('dawnload') || normalized.includes('get') || normalized.includes('access') || normalized.includes('pabe')) {
    return 'download'
  }
  
  // Payment intent
  if (normalized.includes('payment') || normalized.includes('pay') || normalized.includes('buy') || normalized.includes('purchase') || normalized.includes('kinbo') || normalized.includes('kine')) {
    return 'payment'
  }
  
  // Support intent
  if (normalized.includes('support') || normalized.includes('help') || normalized.includes('bivaron') || normalized.includes('problem') || normalized.includes('issue') || normalized.includes('shongkkha')) {
    return 'support'
  }
  
  // Contact intent
  if (normalized.includes('contact') || normalized.includes('kontact') || normalized.includes('jogajog') || normalized.includes('phone') || normalized.includes('email')) {
    return 'contact'
  }
  
  // FAQ intent
  if (normalized.includes('faq') || normalized.includes('question') || normalized.includes('shongkkha')) {
    return 'faq'
  }
  
  return null
}

export async function getResponseForOption(optionId) {
  const response = SUPPORT_RESPONSES[optionId] || SUPPORT_RESPONSES.unknown

  // If it's a category option, fetch products
  if (optionId.startsWith('category-')) {
    const category = optionId.replace('category-', '')
    const products = await getProductsByCategory(category)

    if (products.length === 0) {
      return {
        ...response,
        message: `No ${response.label.toLowerCase()} available at the moment. Please check back later or contact us for custom solutions.`,
        products: []
      }
    }

    return {
      ...response,
      message: `We have ${products.length} ${response.label.toLowerCase()} available. Here are our products:`,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: formatProductPrice(p),
        slug: p.slug,
        category: p.category
      }))
    }
  }

  return response
}

export function getMenuForContext(context) {
  switch (context) {
    case 'services':
      return SERVICES_MENU
    case 'products':
      return PRODUCTS_MENU
    case 'pricing':
      return PRICING_MENU
    case 'order':
      return ORDER_SUPPORT_MENU
    default:
      return MAIN_MENU_OPTIONS
  }
}

export async function handleMainMenuClick(optionId) {
  // Handle admin handoff separately
  if (optionId === 'admin') {
    return handleAdminHandoff()
  }

  // Handle WhatsApp
  if (optionId === 'whatsapp') {
    const whatsappMessage = getPrefilledSupportMessage({
      conversationState: handoffManager.getConversationState(),
      currentTopic: 'General Support',
      lastQuestion: 'I need help with OROFEX'
    })

    openWhatsApp(whatsappMessage)

    return {
      response: {
        title: 'WhatsApp',
        message: 'Opening WhatsApp...',
        type: 'whatsapp'
      },
      options: MAIN_MENU_OPTIONS,
      context: 'main'
    }
  }

  // Handle AI prompt
  if (optionId === 'ai') {
    return {
      response: {
        title: 'Ask AI',
        message: 'I\'m the OROFEX AI assistant. Ask me anything about our products, services, pricing, or support!',
        type: 'ai-prompt'
      },
      options: MAIN_MENU_OPTIONS,
      context: 'main'
    }
  }

  const response = await getResponseForOption(optionId)

  if (optionId === 'back' || optionId === 'main') {
    return {
      response: SUPPORT_RESPONSES.greeting,
      options: MAIN_MENU_OPTIONS,
      context: 'main'
    }
  }

  if (response.options) {
    return {
      response,
      options: getMenuForContext(response.options),
      context: response.options
    }
  }

  return {
    response,
    options: MAIN_MENU_OPTIONS,
    context: 'main'
  }
}

export async function handleSubMenuClick(optionId, currentContext) {
  if (optionId === 'back') {
    return {
      response: SUPPORT_RESPONSES.greeting,
      options: MAIN_MENU_OPTIONS,
      context: 'main'
    }
  }

  if (optionId === 'main') {
    return {
      response: SUPPORT_RESPONSES.greeting,
      options: MAIN_MENU_OPTIONS,
      context: 'main'
    }
  }

  const response = await getResponseForOption(optionId)

  if (response.options) {
    return {
      response,
      options: getMenuForContext(response.options),
      context: response.options
    }
  }

  return {
    response,
    options: getMenuForContext(currentContext),
    context: currentContext
  }
}

export async function processTextMessage(text) {
  const normalized = normalizeText(text)
  const intent = detectIntent(text)

  // Check complexity first
  const complexityInfo = getComplexityInfo(text)

  // If not complex, use intent detection (rules with language support)
  if (!complexityInfo.shouldUseAI) {
    switch (intent) {
      case 'pricing':
        return {
          response: SUPPORT_RESPONSES.pricing,
          options: PRICING_MENU,
          context: 'pricing'
        }
      case 'products':
        return {
          response: SUPPORT_RESPONSES.products,
          options: PRODUCTS_MENU,
          context: 'products'
        }
      case 'services':
        return {
          response: SUPPORT_RESPONSES.services,
          options: SERVICES_MENU,
          context: 'services'
        }
      case 'download':
        return {
          response: SUPPORT_RESPONSES.download,
          options: MAIN_MENU_OPTIONS,
          context: 'main'
        }
      case 'payment':
        return {
          response: SUPPORT_RESPONSES['payment-help'],
          options: MAIN_MENU_OPTIONS,
          context: 'main'
        }
      case 'support':
        return {
          response: SUPPORT_RESPONSES.technical,
          options: MAIN_MENU_OPTIONS,
          context: 'main'
        }
      case 'contact':
        return {
          response: SUPPORT_RESPONSES.contact,
          options: MAIN_MENU_OPTIONS,
          context: 'main'
        }
      case 'faq':
        return {
          response: SUPPORT_RESPONSES.faq,
          options: MAIN_MENU_OPTIONS,
          context: 'main'
        }
      default:
        // If no intent detected, try old keyword matching as fallback
        const lowerText = text.toLowerCase().trim()
        
        if (lowerText.includes('demo') || lowerText.includes('preview') || lowerText.includes('show')) {
          return {
            response: SUPPORT_RESPONSES.demo,
            options: MAIN_MENU_OPTIONS,
            context: 'main'
          }
        }

        if (lowerText.includes('buy') || lowerText.includes('purchase') || lowerText.includes('order') || lowerText.includes('get')) {
          return {
            response: SUPPORT_RESPONSES.buy,
            options: MAIN_MENU_OPTIONS,
            context: 'main'
          }
        }

        if (lowerText.includes('whatsapp') || lowerText.includes('chat') || lowerText.includes('message')) {
          return {
            response: SUPPORT_RESPONSES.whatsapp,
            options: MAIN_MENU_OPTIONS,
            context: 'main'
          }
        }

        // If still no match, let AI handle it
        break
    }
  }

  // If no rule matched and question is complex enough, try AI
  try {
    const aiResult = await callAI(text)
    
    if (aiResult.success) {
      return {
        response: aiResult.response,
        options: MAIN_MENU_OPTIONS,
        context: 'main',
        isAI: true
      }
    }
    
    // AI failed or blocked, return fallback
    return {
      response: aiResult.response || SUPPORT_RESPONSES.off_topic,
      options: MAIN_MENU_OPTIONS,
      context: 'main',
      isAI: false
    }
  } catch (error) {
    console.error('AI error:', error)
    return {
      response: SUPPORT_RESPONSES.off_topic,
      options: MAIN_MENU_OPTIONS,
      context: 'main',
      isAI: false
    }
  }
}

export async function handleAdminHandoff() {
  // Check if user is logged in
  const { auth } = await import('../../firebase')
  if (!auth.currentUser) {
    const whatsappMessage = getPrefilledSupportMessage({
      conversationState: 'waiting-admin',
      currentTopic: 'Support Request',
      lastQuestion: 'I need help with OROFEX products/services'
    })
    
    return {
      response: {
        ...SUPPORT_RESPONSES['login-required'],
        whatsappUrl: getWhatsAppURL(whatsappMessage)
      },
      options: [
        { id: 'whatsapp', label: '📱 Continue on WhatsApp' },
        { id: 'main', label: '🏠 Main Menu' }
      ],
      context: 'main'
    }
  }

  // Check if any admin is REALLY available right now (real Firestore check,
  // not just this browser's stale local state).
  const isAnyAdminAvailable = await agentStatus.checkAnyAdminAvailable()

  if (!isAnyAdminAvailable) {
    const whatsappMessage = getPrefilledSupportMessage({
      conversationState: 'waiting-admin',
      currentTopic: 'Support Request',
      lastQuestion: 'I need help with OROFEX products/services'
    })

    return {
      response: {
        ...SUPPORT_RESPONSES['admin-offline'],
        whatsappUrl: getWhatsAppURL(whatsappMessage)
      },
      options: [
        { id: 'whatsapp', label: '📱 Continue on WhatsApp' },
        { id: 'main', label: '🏠 Main Menu' }
      ],
      context: 'main'
    }
  }

  // Request human support (this is async — must be awaited, otherwise
  // handoffResult would be a Promise and handoffResult.success would
  // always be undefined)
  const handoffResult = await handoffManager.requestHumanSupport()

  if (handoffResult.success) {
    return {
      response: SUPPORT_RESPONSES['waiting-admin'],
      options: [
        { id: 'main', label: '🏠 Main Menu' },
        { id: 'whatsapp', label: '📱 WhatsApp' }
      ],
      context: 'handoff' // Set context to 'handoff' to indicate human mode
    }
  }

  return {
    response: SUPPORT_RESPONSES.unknown,
    options: MAIN_MENU_OPTIONS,
    context: 'main'
  }
}

export function handleAdminJoin() {
  const joinResult = handoffManager.adminJoin()

  if (joinResult.success) {
    return {
      response: SUPPORT_RESPONSES['admin-joined'],
      options: [
        { id: 'end-chat', label: '✕ End Chat' },
        { id: 'return-bot', label: '🤖 Return to Bot' }
      ],
      context: 'human'
    }
  }

  return {
    response: SUPPORT_RESPONSES.unknown,
    options: MAIN_MENU_OPTIONS,
    context: 'main'
  }
}

export function handleAdminLeave() {
  const leaveResult = handoffManager.adminLeave()

  if (leaveResult.success) {
    return {
      response: SUPPORT_RESPONSES['admin-left'],
      options: MAIN_MENU_OPTIONS,
      context: 'main'
    }
  }

  return {
    response: SUPPORT_RESPONSES.unknown,
    options: MAIN_MENU_OPTIONS,
    context: 'main'
  }
}

export function getConversationState() {
  return handoffManager.getConversationState()
}

export function isConversationInHumanMode() {
  return handoffManager.isInHumanMode()
}

export function isConversationWaitingForAdmin() {
  return handoffManager.isWaitingForAdmin()
}