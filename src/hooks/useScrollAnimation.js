import { useCallback, useEffect, useState, useRef } from 'react'

export function useScrollAnimation(threshold = 0.15) {
  const [element, setElement] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const rafRef = useRef(null)
  const ref = useCallback((node) => setElement(node), [])

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
          }
          rafRef.current = requestAnimationFrame(() => {
            setIsVisible(true)
            observer.unobserve(element)
          })
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      observer.disconnect()
    }
  }, [element, threshold])

  return [ref, isVisible]
}
