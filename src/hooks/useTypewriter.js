import { useState, useEffect } from 'react'

export default function useTypewriter(text, speed = 30, pauseDuration = 4000) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    let index = 0
    let typeInterval
    let pauseTimeout

    const startTyping = () => {
      index = 0
      setDisplayText('')
      typeInterval = setInterval(() => {
        index += 1
        setDisplayText(text.slice(0, index))
        if (index >= text.length) {
          clearInterval(typeInterval)
          pauseTimeout = setTimeout(startTyping, pauseDuration)
        }
      }, speed)
    }

    startTyping()

    return () => {
      clearInterval(typeInterval)
      clearTimeout(pauseTimeout)
    }
  }, [text, speed, pauseDuration])

  return displayText
}