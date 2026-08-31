import { testimonials } from '../../data/testimonials'
import useTilt from '../../hooks/useTilt'
import './Testimonials.css'

function TestimonialCard({ item }) {
  const tiltRef = useTilt(4)

  return (
    <div ref={tiltRef} className="testimonial-card glass-panel elevate-hover">
      <span className="testimonial-quote-mark">"</span>
      <p className="testimonial-quote">{item.quote}</p>
      <div className="testimonial-author">
        <h4 className="testimonial-name">{item.name}</h4>
        <p className="testimonial-role">{item.role}</p>
      </div>
    </div>
  )
}

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <h2 className="testimonials-title">What Our Clients Say</h2>

        <div className="testimonials-grid fade-up-stagger">
          {testimonials.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials