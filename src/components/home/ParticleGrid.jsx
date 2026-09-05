import { useEffect, useRef } from 'react'
import './ParticleGrid.css'

function ParticleGrid() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: null, y: null })
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let particles = []
    let animationId

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 8000)

      for (let i = 0; i < numberOfParticles; i++) {
        const originalX = Math.random() * canvas.width
        const originalY = Math.random() * canvas.height
        particles.push({
          x: originalX,
          y: originalY,
          originalX: originalX,
          originalY: originalY,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2.5 + 1.5,
          color: `rgba(0, 216, 255, ${Math.random() * 0.3 + 0.5})`
        })
      }

      particlesRef.current = particles
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, i) => {
        // Calculate forces
        let targetX = particle.originalX
        let targetY = particle.originalY
        let forceMultiplier = 1

        // Mouse attraction (grab mode - particles stick to mouse)
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 250) {
            targetX = mouseRef.current.x
            targetY = mouseRef.current.y
            forceMultiplier = 2.5
          }
        }

        // Calculate velocity towards target
        const dx = targetX - particle.x
        const dy = targetY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0) {
          particle.vx += (dx / distance) * 0.02 * forceMultiplier
          particle.vy += (dy / distance) * 0.02 * forceMultiplier
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Speed limit
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
        if (speed > 4) {
          particle.vx = (particle.vx / speed) * 4
          particle.vy = (particle.vy / speed) * 4
        }

        // Friction to slow down
        particle.vx *= 0.95
        particle.vy *= 0.95

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        // Draw connections
        particles.forEach((otherParticle, j) => {
          if (i === j) return

          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0, 216, 255, ${0.15 * (1 - distance / 120)})`
            ctx.lineWidth = 0.8
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = null
      mouseRef.current.y = null
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', resizeCanvas)

    resizeCanvas()
    animate()

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-grid-canvas" />
}

export default ParticleGrid