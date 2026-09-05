import { Link } from 'react-router-dom'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { useState, useEffect } from 'react'
import './AISolutions.css'

const aiFeatures = [
  'Natural language processing',
  'Predictive analytics',
  'Workflow automation',
  'Intelligent chatbots',
]

const siteTexts = [
  'Building the Future with Digital Products',
  'AI-Powered Solutions for Modern Business',
  'Innovative Technology & Design',
]

function TypingBox({ text, delay = 0 }) {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    let timeout
    const startTyping = () => {
      setIsTyping(true)
      setCurrentIndex(0)
      setDisplayText('')
    }

    timeout = setTimeout(startTyping, delay)
    return () => clearTimeout(timeout)
  }, [delay])

  useEffect(() => {
    if (!isTyping) return

    const currentText = text
    if (currentIndex < currentText.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayText(currentText.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 50)
      return () => clearTimeout(typingTimeout)
    } else {
      const restartTimeout = setTimeout(() => {
        setCurrentIndex(0)
        setDisplayText('')
      }, 3000)
      return () => clearTimeout(restartTimeout)
    }
  }, [isTyping, currentIndex, text])

  return (
    <div className="typing-box">
      <div className="typing-text">{displayText}</div>
      <div className="typing-cursor"></div>
    </div>
  )
}

function AISolutions() {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section className="ai-solutions">
      <div className="ai-solutions-glow"></div>

      <div ref={ref} className={`ai-solutions-container reveal ${isVisible ? 'visible' : ''}`}>
        <div className="ai-solutions-content">
          <h2 className="ai-solutions-title">
            Powered by <span className="ai-highlight">Artificial Intelligence</span>
          </h2>
          <p className="ai-solutions-subtitle">
            We build AI-driven systems that automate workflows, understand data, and help your business make smarter decisions.
          </p>

          <ul className="ai-features-list">
            {aiFeatures.map((feature, index) => (
              <li key={index} className="ai-feature-item">
                <span className="ai-feature-dot"></span>
                {feature}
              </li>
            ))}
          </ul>

          <Link to="/ai" className="ai-solutions-btn">
            Explore AI Solutions
          </Link>
        </div>

        <div className="ai-solutions-visual">
          <div className="typing-boxes-container">
            <TypingBox text={siteTexts[0]} delay={0} />
            <TypingBox text={siteTexts[1]} delay={1000} />
            <TypingBox text={siteTexts[2]} delay={2000} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AISolutions