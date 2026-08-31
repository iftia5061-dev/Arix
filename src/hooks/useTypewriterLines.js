import { useState, useEffect } from 'react'

export default function useTypewriterLines(lines, speed = 25, pauseDuration = 4000) {
  const [displayLines, setDisplayLines] = useState(lines.map(() => ''))

  useEffect(() => {
    let cancelled = false
    const timers = []

    const typeLine = (lineIndex, charIndex, onLineDone) => {
      if (cancelled) return
      if (charIndex > lines[lineIndex].length) {
        onLineDone()
        return
      }
      setDisplayLines((prev) => {
        const next = [...prev]
        next[lineIndex] = lines[lineIndex].slice(0, charIndex)
        return next
      })
      timers.push(setTimeout(() => typeLine(lineIndex, charIndex + 1, onLineDone), speed))
    }

    const typeAll = (lineIndex) => {
      if (cancelled) return
      if (lineIndex >= lines.length) {
        timers.push(setTimeout(() => {
          setDisplayLines(lines.map(() => ''))
          typeAll(0)
        }, pauseDuration))
        return
      }
      typeLine(lineIndex, 0, () => typeAll(lineIndex + 1))
    }

    setDisplayLines(lines.map(() => ''))
    typeAll(0)

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [lines, speed, pauseDuration])

  return displayLines
}