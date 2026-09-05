import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useMagnetic from '../../hooks/useMagnetic'
import ParticleGrid from './ParticleGrid'
import CodeBox from './CodeBox'
import './Hero.css'

function Hero() {
  const magneticPrimary = useMagnetic(0.25)
  const magneticSecondary = useMagnetic(0.25)
  const [typedWords, setTypedWords] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [titleComplete, setTitleComplete] = useState(false)

  const words = [
    "Building",
    "the",
    "Future",
    "with",
    "Digital",
    "Products",
    "&",
    "AI",
    "Solutions"
  ]

  const descriptionText = "Orofex creates powerful software, SaaS platforms, mobile apps, and AI-driven solutions to help your business grow."
  const [typedDescription, setTypedDescription] = useState('')
  const [descriptionCharIndex, setDescriptionCharIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const [colorIndex, setColorIndex] = useState(0)

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const currentWord = words[currentWordIndex]

      if (currentCharIndex < currentWord.length) {
        const timeout = setTimeout(() => {
          setCurrentCharIndex(prev => prev + 1)
        }, 100)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setTypedWords(prev => [...prev, currentWord])
          setCurrentWordIndex(prev => prev + 1)
          setCurrentCharIndex(0)
        }, 200)
        return () => clearTimeout(timeout)
      }
    } else {
      setTitleComplete(true)
      setIsTyping(true)
    }
  }, [currentWordIndex, currentCharIndex, words])

  useEffect(() => {
    if (isTyping && descriptionCharIndex < descriptionText.length) {
      const timeout = setTimeout(() => {
        setTypedDescription(prev => prev + descriptionText[descriptionCharIndex])
        setDescriptionCharIndex(prev => prev + 1)
      }, 50)
      return () => clearTimeout(timeout)
    } else if (isTyping && descriptionCharIndex >= descriptionText.length) {
      setIsTyping(false)
      setIsZooming(true)
      const timeout = setTimeout(() => {
        setIsZooming(false)
        setTypedDescription('')
        setDescriptionCharIndex(0)
        setColorIndex(prev => (prev + 1) % 2)
        setIsTyping(true)
      }, 3500)
      return () => clearTimeout(timeout)
    }
  }, [descriptionCharIndex, descriptionText, isTyping])

  return (
    <section className="hero">
      <ParticleGrid />
      <div className="hero-glow"></div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            AI-Powered Digital Products
          </div>

          <div className="hero-title-box">
            <h1 className={`hero-title ${titleComplete ? 'hero-title-complete' : ''}`}>
              {typedWords.map((word, index) => (
                <span key={index} className="hero-typed-word">{word} </span>
              ))}
              {currentWordIndex < words.length && (
                <span className="hero-current-word">
                  {words[currentWordIndex].slice(0, currentCharIndex)}
                  <span className="hero-cursor">|</span>
                </span>
              )}
              {titleComplete && <span className="hero-cursor">|</span>}
            </h1>
          </div>

          {titleComplete && (
            <p className={`hero-description hero-description-${colorIndex} ${isZooming ? 'hero-description-zoom' : ''}`}>
              {typedDescription}
              <span className="hero-description-cursor">|</span>
            </p>
          )}

          <div className="hero-actions">
            <Link ref={magneticPrimary} to="/products" className="hero-btn-primary">
              Explore Products
              <span className="hero-btn-arrow">→</span>
            </Link>
            <Link ref={magneticSecondary} to="/about" className="hero-btn-secondary">
              How It Works
            </Link>
          </div>
        </div>

        <div className="hero-preview">
          <CodeBox />
          <div className="floating-badge floating-badge-1">Digital Products</div>
          <div className="floating-badge floating-badge-2">AI Solutions</div>
          <div className="floating-badge floating-badge-3">Software</div>
          <div className="floating-badge floating-badge-4">SaaS</div>
        </div>
      </div>
    </section>
  )
}

export default Hero