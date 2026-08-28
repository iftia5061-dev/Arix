import { Link } from 'react-router-dom'
import { blogPosts } from '../data/blog'
import './Blog.css'

function Blog() {
  return (
    <div className="blog-page">
      <section className="blog-hero">
        <h1 className="blog-hero-title">Orofex Blog</h1>
        <p className="blog-hero-subtitle">
          Insights on software, AI, and building digital products that last.
        </p>
      </section>

      <section className="blog-list">
        <div className="blog-list-grid">
          {blogPosts.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card">
              <div className="blog-card-image">{post.image}</div>
              <div className="blog-card-content">
                <span className="blog-card-category">{post.category}</span>
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-meta">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Blog