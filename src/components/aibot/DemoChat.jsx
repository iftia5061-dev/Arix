import { useState, useRef, useEffect } from 'react'
import './DemoChat.css'

const botReplies = [
  {
    keywords: ['price', 'pricing', 'cost', 'koto', 'daam', 'দাম'],
    reply: 'Our AI bots start from ৳6,000 (Starter) up to ৳40,000+ (Enterprise with resell rights). Want a custom quote for your business?',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'salam', 'হাই', 'হ্যালো'],
    reply: "Hi there! 👋 I'm the ARIX demo assistant. Ask me about pricing, features, or how AI bots can help your business.",
  },
  {
    keywords: ['feature', 'do', 'can you', 'what'],
    reply: 'I can answer FAQs, capture leads, connect to WhatsApp/Messenger, and even hand off to a human when needed — all customized to your business.',
  },
  {
    keywords: ['whatsapp'],
    reply: 'Yes! WhatsApp integration is available starting from our Growth package (৳18,000).',
  },
  {
    keywords: ['reseller', 'resell', 'white label', 'white-label'],
    reply: 'Our Enterprise package includes white-label rights — perfect for agencies who want to resell AI bots under their own brand.',
  },
  {
    keywords: ['thanks', 'thank you', 'dhonnobad', 'ধন্যবাদ'],
    reply: "You're welcome! Feel free to ask anything else, or head to our Contact page to start a real project. 🚀",
  },
]

const fallbackReply =
  "That's a great question — in a live deployment, I'd be trained specifically on your business data to answer this. Want to see a real custom bot? Contact us!"

function getBotReply(userMessage) {
  const lower = userMessage.toLowerCase()
  for (const item of botReplies) {
    if (item.keywords.some((keyword) => lower.includes(keyword))) {
      return item.reply
    }
  }
  return fallbackReply
}

function DemoChat() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm a live demo of an ARIX AI bot. Try asking me about pricing, features, or WhatsApp integration." },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { sender: 'user', text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    const reply = getBotReply(input)

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }])
      setIsTyping(false)
    }, 800)
  }

  return (
    <div className="demo-chat">
      <div className="demo-chat-header">
        <span className="demo-chat-dot"></span>
        ARIX Demo Assistant
      </div>

      <div className="demo-chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`demo-chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}

        {isTyping && (
          <div className="demo-chat-bubble bot typing">
            <span></span><span></span><span></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="demo-chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about pricing, features..."
        />
        <button type="submit">➤</button>
      </form>
    </div>
  )
}

export default DemoChat