import { Link } from 'react-router-dom'
import { categories } from '../../data/categories'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import './Categories.css'

function Categories() {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <section className="categories">
      <div className="categories-container">
        <h2 className="categories-title">Explore by Category</h2>

        <div
          ref={ref}
          className={`categories-grid reveal ${isVisible ? 'visible' : ''}`}
        >
          {categories.map((category) => (
            <Link
              to={`/products?category=${category.slug}`}
              key={category.id}
              className="category-card"
            >
              <div className="category-icon">{category.icon}</div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories