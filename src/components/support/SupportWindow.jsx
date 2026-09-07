import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { auth } from '../../firebase'
import { useAuth } from '../../context/authStore'
import SupportHeader from './SupportHeader'
import SupportMessages from './SupportMessages'
import SupportInput from './SupportInput'
import { MAIN_MENU_OPTIONS, SERVICES_MENU, PRODUCTS_MENU, PRICING_MENU, ORDER_SUPPORT_MENU } from '../../support/data/botMenus'
import { SUPPORT_RESPONSES } from '../../support/data/supportResponses'
import { handleMainMenuClick, handleSubMenuClick, processTextMessage, isConversationInHumanMode, isConversationWaitingForAdmin } from '../../support/rules/ruleEngine'
import { conversationManager } from '../../support/live/conversationManager'
import { handoffManager } from '../../support/live/handoff'
import { getProductBySlug } from '../../support/data/productData'
import { getWelcomeMessage } from '../../support/settings/botSettings'
import './SupportWindow.css'

function SupportWindow({ isOpen, onClose }) {
  const { user } = useAuth()
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [currentContext, setCurrentContext] = useState('main')
  const [isLoading, setIsLoading] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [conversationHistory, setConversationHistory] = useState(['main'])
  const [currentProduct, setCurrentProduct] = useState(null)

  // Detect product page context
  useEffect(() => {
    if (!isOpen) return

    const path = location.pathname
    const productMatch = path.match(/^\/products\/([^/]+)$/)

    if (productMatch) {
      const productSlug = productMatch[1]
      setCurrentProduct(productSlug)

      // Show a generic greeting immediately, then swap in the real
      // product name once it loads (falls back to the slug if the
      // lookup fails, so nothing breaks either way).
      const buildGreeting = (displayName) => ({
        id: 1,
        type: 'bot',
        title: 'Product Support',
        text: `I see you're viewing ${displayName}. How can I help you with this product?`,
        options: [
          { id: 'product-features', label: '✨ Features' },
          { id: 'product-pricing', label: '💰 Pricing' },
          { id: 'product-demo', label: '👁 Demo' },
          { id: 'product-buy', label: '💳 Buy Now' },
          { id: 'product-support', label: '🛠 Support' },
          { id: 'custom', label: '🎨 Custom Project' },
          { id: 'main', label: '🏠 Main Menu' }
        ],
        action: null,
        timestamp: new Date()
      })

      setMessages([buildGreeting(productSlug)])

      let cancelled = false
      getProductBySlug(productSlug).then((product) => {
        if (cancelled) return
        if (product?.name) {
          setMessages([buildGreeting(product.name)])
        }
      })

      return () => {
        cancelled = true
      }
    } else {
      setCurrentProduct(null)
      setMessages([
        {
          id: 1,
          type: 'bot',
          title: 'Welcome',
          text: getWelcomeMessage(),
          options: MAIN_MENU_OPTIONS,
          action: null,
          timestamp: new Date()
        }
      ])
    }
  }, [isOpen, location.pathname])

  // Auto-create conversation when support opens (only if logged in)
  useEffect(() => {
    if (isOpen && !currentProduct && user) {
      // Create conversation for general support
      const createConv = async () => {
        const result = await conversationManager.createConversation({
          topic: 'General Support',
          message: 'Customer opened support chat'
        })
        if (result.success) {
          handoffManager.setConversationId(result.conversationId)
        }
      }
      createConv()
    }
  }, [isOpen, currentProduct, user])

  const handleBack = () => {
    if (conversationHistory.length > 1) {
      const newHistory = [...conversationHistory]
      newHistory.pop()
      const previousContext = newHistory[newHistory.length - 1]
      setConversationHistory(newHistory)
      setCurrentContext(previousContext)

      const result = {
        context: previousContext,
        response: SUPPORT_RESPONSES.greeting,
        options: MAIN_MENU_OPTIONS,
        isAI: false
      }

      const newMessage = {
        id: messages.length + 1,
        type: 'bot',
        title: result.response.title,
        text: result.response.message,
        options: result.options,
        action: result.response.action || null,
        products: result.response.products || null,
        type: result.response.type || null,
        isAI: result.isAI || false,
        timestamp: new Date()
      }

      setMessages([...messages, newMessage])
    }
  }

  const showBackButton = currentContext !== 'main'

  const handleOptionClick = async (optionId) => {
    setIsLoading(true)

    let result

    if (currentContext === 'main') {
      result = await handleMainMenuClick(optionId)
    } else {
      result = await handleSubMenuClick(optionId, currentContext)
    }

    setCurrentContext(result.context)

    if (result.context !== currentContext) {
      setConversationHistory([...conversationHistory, result.context])
    }

    const newMessage = {
      id: messages.length + 1,
      type: 'bot',
      title: result.response.title,
      text: result.response.message,
      options: result.options,
      action: result.response.action || null,
      products: result.response.products || null,
      type: result.response.type || null,
      isAI: result.isAI || false,
      timestamp: new Date()
    }

    setMessages([...messages, newMessage])
    setIsLoading(false)
  }

  const handleSendMessage = async (text) => {
    // Check if in human mode - if so, send to Firebase and let admin handle
    if (isConversationInHumanMode()) {
      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        text,
        timestamp: new Date()
      }

      setMessages([...messages, userMessage])

      // Send to Firebase
      const conversationId = handoffManager.getHandoffInfo().conversationId
      if (conversationId) {
        await conversationManager.addMessage(conversationId, {
          senderId: auth.currentUser?.uid || 'anonymous',
          senderType: 'customer',
          text
        })
      }
      return
    }

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text,
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])

    // Send to Firebase
    const conversationId = handoffManager.getHandoffInfo().conversationId
    if (conversationId) {
      await conversationManager.addMessage(conversationId, {
        senderId: auth.currentUser?.uid || 'anonymous',
        senderType: 'customer',
        text
      })
    }

    // Check if AI might be needed (no keyword match)
    const lowerText = text.toLowerCase().trim()
    const keywords = ['service', 'design', 'development', 'product', 'software', 'app', 'price', 'cost', 'payment', 'how much', 'demo', 'preview', 'show', 'buy', 'purchase', 'order', 'get', 'download', 'access', 'file', 'technical', 'issue', 'problem', 'error', 'bug', 'faq', 'question', 'help', 'whatsapp', 'chat', 'message', 'ai', 'artificial', 'intelligence', 'bot', 'saas', 'subscription', 'platform', 'web', 'website', 'landing', 'mobile', 'android', 'ios']

    const hasKeyword = keywords.some(keyword => lowerText.includes(keyword))

    if (!hasKeyword) {
      setIsAIThinking(true)
    }

    const result = await processTextMessage(text)
    setCurrentContext(result.context)

    setIsAIThinking(false)

    const botMessage = {
      id: messages.length + 2,
      type: 'bot',
      title: result.response.title,
      text: result.response.message,
      options: result.options,
      action: result.response.action || null,
      products: result.response.products || null,
      type: result.response.type || null,
      isAI: result.isAI || false,
      timestamp: new Date()
    }

    setMessages([...messages, userMessage, botMessage])

    // Send AI response to Firebase if it was AI-generated
    if (result.isAI && conversationId) {
      await conversationManager.addMessage(conversationId, {
        senderId: 'ai',
        senderType: 'ai',
        text: result.response.message
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="support-window">
      <SupportHeader onClose={onClose} onBack={handleBack} showBackButton={showBackButton} />
      <SupportMessages messages={messages} onOptionClick={handleOptionClick} isLoading={isLoading} isAIThinking={isAIThinking} />
      <SupportInput onSend={handleSendMessage} disabled={isConversationInHumanMode()} />
    </div>
  )
}

export default SupportWindow
