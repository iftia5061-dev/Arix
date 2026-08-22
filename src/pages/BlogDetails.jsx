import { useParams, Link } from 'react-router-dom'
import { blogPosts } from '../data/blog'
import './BlogDetails.css'

function BlogDetails() {
  const { slug } = useParams()
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="blog-not-found">
        <h2>Article Not Found</h2>
        <Link to="/blog" className="back-link">← Back to Blog</Link>
      </div>
    )
  }

  return (
    <div className="blog-details">
      <div className="blog-details-container">
        <Link to="/blog" className="back-link">← Back to Blog</Link>

        <span className="blog-details-category">{post.category}</span>
        <h1 className="blog-details-title">{post.title}</h1>

        <div className="blog-details-meta">
          <span>{post.author}</span>
          <span>•</span>
          <span>{post.date}</span>
        </div>

        <div className="blog-details-image">{post.image}</div>

        <div className="blog-details-body">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BlogDetails