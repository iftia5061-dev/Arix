import { useState } from 'react'
import { faqs } from '../data/faq'
import './FAQ.css'

function FAQ() {
  const [openId, setOpenId] = useState(null)

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div className="faq-page">
      <section className="faq-hero">
        <h1 className="faq-hero-title">Frequently Asked Questions</h1>
        <p className="faq-hero-subtitle">
          Everything you need to know about working with ARIX.
        </p>
      </section>

      <section className="faq-list">
        <div className="faq-list-container">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`faq-item ${openId === faq.id ? 'open' : ''}`}
              onClick={() => toggleFaq(faq.id)}
            >
              <div className="faq-question">
                <span>{faq.question}</span>
                <span className="faq-toggle">{openId === faq.id ? '−' : '+'}</span>
              </div>
              {openId === faq.id && (
                <p className="faq-answer">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default FAQ