import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { auth } from '../../firebase'
import { useAuth } from '../../context/authStore'
import SupportHeader from './SupportHeader'
import SupportMessages from './SupportMessages'
import SupportInput from './SupportInput'
import { MAIN_MENU_OPTIONS, SERVICES_MENU, PRODUCTS_MENU, PRICING_MENU, ORDER_SUPPORT_MENU } from '../../support/data/botMenus'
import { SUPPORT_RESPONSES } from '../../support/data/supportResponses'
import { handleMainMenuClick, handleSubMenuClick, processTextMessage } from '../../support/rules/ruleEngine'
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
  const [conversationId, setConversationId] = useState(null)
  const [isInHumanMode, setIsInHumanMode] = useState(false)
  const unsubscribeRef = useRef(null)
  const previousHumanModeRef = useRef(false)

  // Detect product page context
  useEffect(() => {
    if (!isOpen) return

    const path = location.pathname
    const productMatch = path.match(/^\/products\/([^/]+)$/)

    if (productMatch) {
      const productSlug = productMatch[1]
      setCurrentProduct(productSlug)

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

  // Initialize Firebase conversation and listener - ONLY when in human mode
  useEffect(() => {
    if (isOpen && !currentProduct && user && isInHumanMode) {
      const initConversation = async () => {
        // Clean up any existing listener
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
          unsubscribeRef.current = null
        }

        const result = await conversationManager.createConversation({
          topic: 'General Support',
          message: 'Customer opened support chat'
        })
        
        if (result.success) {
          setConversationId(result.conversationId)
          handoffManager.setConversationId(result.conversationId)
          
          // Setup realtime listener for this conversation
          const unsubscribe = conversationManager.listenToConversation(result.conversationId, (convData) => {
            if (convData.messages && convData.messages.length > 0) {
              // Convert Firebase messages to UI format and sort by timestamp
              const firebaseMessages = convData.messages
                .map(msg => ({
                  id: msg.id,
                  type: msg.senderType === 'admin' ? 'admin' : msg.senderType === 'ai' ? 'bot' : msg.senderType === 'system' ? 'system' : 'user',
                  text: msg.text,
                  timestamp: new Date(msg.timestamp)
                }))
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              
              // Replace local messages with Firebase messages to ensure consistency
              setMessages(firebaseMessages)
            }
            
            // Sync human mode state from Firebase
            const newMode = convData.mode === 'human'
            const wasInHumanModeBefore = previousHumanModeRef.current
            previousHumanModeRef.current = newMode
            setIsInHumanMode(newMode)
            
            // Only sync Firebase messages when in human mode
            // In bot mode, keep local messages for bot functionality
            if (newMode) {
              const firebaseMessages = convData.messages
                .map(msg => ({
                  id: msg.id,
                  type: msg.senderType === 'admin' ? 'admin' : msg.senderType === 'ai' ? 'bot' : msg.senderType === 'system' ? 'system' : 'user',
                  text: msg.text,
                  timestamp: new Date(msg.timestamp)
                }))
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              
              setMessages(firebaseMessages)
            }
          })
          
          unsubscribeRef.current = unsubscribe
        }
      }
      
      initConversation()
    }

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [isOpen, currentProduct, user, isInHumanMode])

  // Remove the duplicate admin handoff effect since we handle it through Firebase listener

  // Cleanup when window closes
  useEffect(() => {
    if (!isOpen) {
      // Cleanup listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      
      // Reset all states
      setMessages([])
      setConversationId(null)
      setIsInHumanMode(false)
      setConversationHistory(['main'])
      setCurrentContext('main')
    }
  }, [isOpen])

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

    // Handle special option for returning to AI bot
    if (optionId === 'return-bot') {
      setIsInHumanMode(false)
      setCurrentContext('main')
      setConversationHistory(['main'])
      
      const botMessage = {
        id: messages.length + 1,
        type: 'bot',
        title: 'AI Bot Active',
        text: 'I\'m the OROFEX AI assistant. How can I help you today?',
        options: MAIN_MENU_OPTIONS,
        timestamp: new Date()
      }
      
      setMessages([...messages, botMessage])
      setIsLoading(false)
      return
    }

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
    // Check if in human mode or handoff context - if so, send to Firebase and let admin handle
    if (isInHumanMode || currentContext === 'handoff') {
      if (!conversationId) return

      const userMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'user',
        text,
        timestamp: new Date()
      }

      setMessages([...messages, userMessage])

      // Send to Firebase
      await conversationManager.addMessage(conversationId, {
        senderId: auth.currentUser?.uid || 'anonymous',
        senderType: 'customer',
        text
      })
      return
    }

    // Normal bot mode - don't involve Firebase
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text,
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])

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
  }

  if (!isOpen) return null

  return (
    <div className="support-window">
      <SupportHeader onClose={onClose} onBack={handleBack} showBackButton={showBackButton} />
      <SupportMessages messages={messages} onOptionClick={handleOptionClick} isLoading={isLoading} isAIThinking={isAIThinking} />
      <SupportInput onSend={handleSendMessage} disabled={false} />
    </div>
  )
}

export default SupportWindow
