import { useCallback, useEffect, useState } from 'react'

export function useScrollAnimation(threshold = 0.15) {
  const [element, setElement] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useCallback((node) => setElement(node), [])

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [element, threshold])

  return [ref, isVisible]
}
