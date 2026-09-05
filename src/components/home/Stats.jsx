import { useState, useEffect, useRef } from 'react'
import './Stats.css'

const stats = [
  { number: 25, suffix: '+', label: 'Products', glowColor: '#06b6d4' },
  { number: 150, suffix: '+', label: 'Projects Delivered', glowColor: '#8b5cf6' },
  { number: 40, suffix: '+', label: 'Happy Clients', glowColor: '#06b6d4' },
  { number: 5, suffix: '+', label: 'Years of Experience', glowColor: '#8b5cf6' },
]

function StatItem({ stat, index }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const stepValue = stat.number / steps
    let current = 0
    const timer = setInterval(() => {
      current += stepValue
      if (current >= stat.number) {
        setCount(stat.number)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, stat.number])

  return (
    <div 
      ref={ref}
      className="stat-item" 
      style={{
        '--stat-glow': stat.glowColor,
      }}
    >
      <h3 className="stat-number">
        {count}{stat.suffix}
      </h3>
      <p className="stat-label">{stat.label}</p>
    </div>
  )
}

function Stats() {
  return (
    <section className="stats">
      <div className="stats-container">
        {stats.map((stat, index) => (
          <StatItem key={index} stat={stat} index={index} />
        ))}
      </div>
    </section>
  )
}

export default Stats