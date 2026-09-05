import { useRef, useEffect } from 'react'
import { throttle } from '../utils/debounce'

export default function useSpotlight() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = throttle((e) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      el.style.setProperty('--spotlight-x', `${x}px`)
      el.style.setProperty('--spotlight-y', `${y}px`)
    }, 16)

    el.addEventListener('mousemove', handleMouseMove)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return ref
}
