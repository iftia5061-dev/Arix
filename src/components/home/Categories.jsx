import { Link } from 'react-router-dom'
import { categories } from '../../data/categories'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { useState, useEffect } from 'react'
import './Categories.css'

const categoryDescriptions = {
  'web-design': [
    'Beautiful, responsive websites',
    'Modern UI/UX design principles'
  ],
  'software': [
    'Powerful desktop applications',
    'Cross-platform compatibility'
  ],
  'saas': [
    'Cloud-based business solutions',
    'Scalable subscription models'
  ],
  'ai': [
    'Intelligent automation systems',
    'Machine learning integration'
  ],
  'mobile-apps': [
    'Native iOS and Android apps',
    'Cross-platform development'
  ],
  'tools': [
    'Productivity enhancing utilities',
    'Developer-friendly APIs'
  ]
}

function CategoryCard({ category, index }) {
  const accentColors = {
    'web-design': '#06b6d4',
    'software': '#3b82f6',
    'saas': '#a855f7',
    'ai': '#ec4899',
    'mobile-apps': '#60a5fa',
    'tools': '#10b981'
  }

  const accentColor = accentColors[category.slug] || '#06b6d4'
  const descriptions = categoryDescriptions[category.slug] || categoryDescriptions['web-design']
  const [currentDescIndex, setCurrentDescIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const currentText = descriptions[currentDescIndex]
    if (currentIndex < currentText.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayText(currentText.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 50)
      return () => clearTimeout(typingTimeout)
    } else {
      const switchTimeout = setTimeout(() => {
        setCurrentDescIndex((prev) => (prev + 1) % descriptions.length)
        setCurrentIndex(0)
        setDisplayText('')
      }, 4000)
      return () => clearTimeout(switchTimeout)
    }
  }, [currentIndex, currentDescIndex, descriptions])

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="category-card"
      style={{
        '--accent-color': accentColor,
        animationDelay: `${index * 100}ms`
      }}
    >
      <div className="category-icon-circle">
        <div className="category-icon">{category.icon}</div>
      </div>
      <h3 className="category-name">{category.name}</h3>
      <div className="category-typing-text">
        <span className="typed-text">{displayText}</span>
        <span className="typing-cursor"></span>
      </div>
    </Link>
  )
}

function Categories() {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section className="categories">
      <div className="categories-container">
        <div className="categories-header">
          <span className="categories-label">BROWSE THE STORE</span>
          <h2 className="categories-title">Explore by Category</h2>
          <p className="categories-subtitle">Find digital tools built for your next idea.</p>
        </div>

        <div
          ref={ref}
          className={`categories-grid reveal ${isVisible ? 'visible' : ''}`}
        >
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories