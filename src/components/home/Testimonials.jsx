import { testimonials } from '../../data/testimonials'
import './Testimonials.css'

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <h2 className="testimonials-title">What Our Clients Say</h2>

        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <div className="testimonial-card" key={item.id}>
              <p className="testimonial-quote">"{item.quote}"</p>
              <div className="testimonial-author">
                <h4 className="testimonial-name">{item.name}</h4>
                <p className="testimonial-role">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials