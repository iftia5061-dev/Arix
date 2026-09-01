import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { hasAlreadyRated, markAsRated } from '../../utils/ratingStorage'
import './RatingPopup.css'

const SHOW_AFTER_MS = 45000 // 45 seconds

function RatingPopup() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (hasAlreadyRated()) return undefined

    const timer = setTimeout(() => {
      setVisible(true)
    }, SHOW_AFTER_MS)

    return () => clearTimeout(timer)
  }, [])

  async function handleSubmit() {
    if (rating === 0) return

    try {
      await addDoc(collection(db, 'ratings'), {
        rating,
        comment: comment.trim(),
        page: location.pathname,
        createdAt: serverTimestamp(),
      })
      markAsRated()
      setSubmitted(true)
      setTimeout(() => setVisible(false), 2000)
    } catch (error) {
      console.error('Rating submit error:', error)
    }
  }

  function handleDismiss() {
    markAsRated() // don't ask again this browser, even if they skip
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="rating-popup">
      <button type="button" className="rating-popup-close" onClick={handleDismiss}>✕</button>

      {submitted ? (
        <p className="rating-popup-thanks">Thanks for your feedback! 🎉</p>
      ) : (
        <>
          <p className="rating-popup-title">How's your experience with Orofex?</p>

          <div className="rating-popup-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-star ${(hoverRating || rating) >= star ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} star`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            className="rating-popup-comment"
            placeholder="Any comments? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="2"
          />

          <button type="button" className="rating-popup-submit" onClick={handleSubmit} disabled={rating === 0}>
            Submit
          </button>
        </>
      )}
    </div>
  )
}

export default RatingPopup