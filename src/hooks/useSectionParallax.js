import { useRef, useEffect } from 'react'
import { throttle } from '../utils/debounce'

export default function useSectionParallax(intensity = 0.02) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = throttle((e) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const rotateX = ((mouseY - centerY) / centerY) * -intensity
      const rotateY = ((mouseX - centerX) / centerX) * intensity

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }, 16)

    const handleMouseLeave = () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    }

    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [intensity])

  return ref
}
