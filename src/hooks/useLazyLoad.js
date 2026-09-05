import { useState, useEffect, useRef } from 'react'

export function useLazyLoad(threshold = 0.1) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.unobserve(element)
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold])

  return [elementRef, isIntersecting, isLoaded, setIsLoaded]
}

export function LazyImage({ src, alt, className, ...props }) {
  const [ref, isIntersecting, isLoaded, setIsLoaded] = useLazyLoad()
  const [imageSrc, setImageSrc] = useState(null)

  useEffect(() => {
    if (isIntersecting && src) {
      const img = new Image()
      img.src = src
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
      }
    }
  }, [isIntersecting, src, setIsLoaded])

  return (
    <img
      ref={ref}
      src={imageSrc}
      alt={alt}
      className={`${className || ''} ${isLoaded ? 'loaded' : 'loading'}`}
      loading="lazy"
      {...props}
    />
  )
}
