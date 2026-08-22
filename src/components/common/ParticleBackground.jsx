import { useEffect, useRef } from 'react'
import './ParticleBackground.css'

function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const blackhole = { x: width / 2, y: height / 2, radius: 26 }

    // ---------- 02 Far Galaxy ----------
    const galaxyColors = ['#251044', '#102B5C', '#302060', '#164B63']
    const galaxies = []
    for (let i = 0; i < 4; i++) {
      galaxies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        rx: Math.random() * 220 + 180,
        ry: Math.random() * 140 + 100,
        color: galaxyColors[i % galaxyColors.length],
        opacity: Math.random() * 0.1 + 0.05,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.0003,
      })
    }

    // ---------- 03/04/09 Star Layers ----------
    function makeStars(count, radiusRange, speedRange, colors) {
      const stars = []
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * (radiusRange[1] - radiusRange[0]) + radiusRange[0],
          speed: Math.random() * (speedRange[1] - speedRange[0]) + speedRange[0],
          angle: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.01 + 0.003,
        })
      }
      return stars
    }

    const tinyStars = makeStars(140, [0.5, 1.1], [0.02, 0.05], ['#FFFFFF', '#DCEBFF'])
    const mediumStars = makeStars(40, [1.2, 1.9], [0.03, 0.07], ['#FFFFFF', '#DCEBFF', '#CDB8FF'])
    const brightStars = makeStars(6, [2, 2.8], [0.02, 0.04], ['#FFFFFF', '#DCEBFF'])

    // ---------- 05 Distant Planets (free drifting, no orbit) ----------
    const planetPalette = [
      { base: '#1557C0', highlight: '#48B8FF' }, // Earth-like
      { base: '#8F3F2E', highlight: '#D97854' }, // Mars-like
      { base: '#8B6B50', highlight: '#D8B98A' }, // Jupiter-like
      { base: '#A88A67', highlight: '#E3C99A' }, // Saturn-like
      { base: '#487B9E', highlight: '#A9E7FF' }, // Ice
      { base: '#5D477D', highlight: '#B29BDE' }, // Gas
    ]

    const distantPlanets = []
    for (let i = 0; i < 3; i++) {
      const palette = planetPalette[Math.floor(Math.random() * planetPalette.length)]
      distantPlanets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 6 + 5,
        base: palette.base,
        highlight: palette.highlight,
        speedX: (Math.random() - 0.5) * 0.04,
        speedY: (Math.random() - 0.5) * 0.04,
      })
    }

    // ---------- 08 Near Planets (orbiting the blackhole) ----------
    const nearPlanets = [
      { distance: 90, speed: 0.0018, angle: Math.random() * Math.PI * 2, radius: 5, ...planetPalette[0] },
      { distance: 140, speed: 0.0013, angle: Math.random() * Math.PI * 2, radius: 6, ...planetPalette[1] },
      { distance: 195, speed: 0.0009, angle: Math.random() * Math.PI * 2, radius: 8, ...planetPalette[2] },
      { distance: 250, speed: 0.0006, angle: Math.random() * Math.PI * 2, radius: 7, ...planetPalette[3] },
    ]

    // ---------- 07 Gravity Particles (orbit / pull / free) ----------
    const gravityParticles = []
    const gravityCount = 90
    for (let i = 0; i < gravityCount; i++) {
      const behavior = Math.random()
      let type = 'free'
      if (behavior < 0.35) type = 'orbit'
      else if (behavior < 0.6) type = 'pull'

      gravityParticles.push({
        type,
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.6,
        color: Math.random() > 0.5 ? '#DCEBFF' : '#CDB8FF',
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        orbitDistance: Math.random() * 200 + 80,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
      })
    }

    function resetPullParticle(p) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.max(width, height) * 0.6
      p.x = blackhole.x + Math.cos(angle) * dist
      p.y = blackhole.y + Math.sin(angle) * dist
      p.radius = Math.random() * 1.4 + 0.6
    }

    let accretionRotation = 0
    let pulsePhase = 0

    function draw() {
      // ---- 01 Background gradient ----
      const bgGradient = ctx.createLinearGradient(0, 0, width, height)
      bgGradient.addColorStop(0, '#02030A')
      bgGradient.addColorStop(0.5, '#050817')
      bgGradient.addColorStop(1, '#010207')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // ---- 02 Far Galaxies ----
      galaxies.forEach((g) => {
        g.rotation += g.rotationSpeed
        ctx.save()
        ctx.translate(g.x, g.y)
        ctx.rotate(g.rotation)
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, g.rx)
        grad.addColorStop(0, g.color)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.globalAlpha = g.opacity
        ctx.beginPath()
        ctx.ellipse(0, 0, g.rx, g.ry, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        ctx.globalAlpha = 1
      })

      // ---- 03 Tiny Stars & 04 Medium Stars ----
      function drawStars(stars) {
        stars.forEach((s) => {
          s.x += Math.cos(s.angle) * s.speed
          s.y += Math.sin(s.angle) * s.speed
          if (s.x < 0) s.x = width
          if (s.x > width) s.x = 0
          if (s.y < 0) s.y = height
          if (s.y > height) s.y = 0

          s.twinklePhase += s.twinkleSpeed
          const twinkle = 0.6 + Math.sin(s.twinklePhase) * 0.4

          ctx.beginPath()
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
          ctx.fillStyle = s.color
          ctx.globalAlpha = twinkle
          ctx.fill()
          ctx.globalAlpha = 1
        })
      }

      drawStars(tinyStars)
      drawStars(mediumStars)

      // ---- 05 Distant Planets ----
      distantPlanets.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < -50) p.x = width + 50
        if (p.x > width + 50) p.x = -50
        if (p.y < -50) p.y = height + 50
        if (p.y > height + 50) p.y = -50

        const grad = ctx.createRadialGradient(
          p.x - p.radius * 0.3, p.y - p.radius * 0.3, 0,
          p.x, p.y, p.radius
        )
        grad.addColorStop(0, p.highlight)
        grad.addColorStop(1, p.base)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.globalAlpha = 0.7
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // ---- 06 Black Hole ----
      // Outer glow (subtle pulse)
      pulsePhase += 0.006
      const pulse = 0.85 + Math.sin(pulsePhase) * 0.15
      const outerGlow = ctx.createRadialGradient(
        blackhole.x, blackhole.y, blackhole.radius * 0.6,
        blackhole.x, blackhole.y, blackhole.radius * 6 * pulse
      )
      outerGlow.addColorStop(0, 'rgba(109, 74, 255, 0.30)')
      outerGlow.addColorStop(0.4, 'rgba(36, 107, 253, 0.14)')
      outerGlow.addColorStop(1, 'rgba(36, 107, 253, 0)')
      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(blackhole.x, blackhole.y, blackhole.radius * 6 * pulse, 0, Math.PI * 2)
      ctx.fill()

      // Accretion disk — very slow rotation
      accretionRotation += 0.0009
      ctx.save()
      ctx.translate(blackhole.x, blackhole.y)
      ctx.rotate(accretionRotation)
      const diskGradient = ctx.createLinearGradient(-blackhole.radius * 4, 0, blackhole.radius * 4, 0)
      diskGradient.addColorStop(0, 'rgba(109, 74, 255, 0)')
      diskGradient.addColorStop(0.3, 'rgba(109, 74, 255, 0.35)')
      diskGradient.addColorStop(0.5, 'rgba(56, 217, 255, 0.25)')
      diskGradient.addColorStop(0.7, 'rgba(36, 107, 253, 0.35)')
      diskGradient.addColorStop(1, 'rgba(36, 107, 253, 0)')
      ctx.strokeStyle = diskGradient
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.ellipse(0, 0, blackhole.radius * 3.4, blackhole.radius * 1.3, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // Black core
      ctx.beginPath()
      ctx.arc(blackhole.x, blackhole.y, blackhole.radius, 0, Math.PI * 2)
      ctx.fillStyle = '#000000'
      ctx.fill()

      // ---- 08 Near Planets (orbiting) ----
      nearPlanets.forEach((planet) => {
        planet.angle += planet.speed
        const px = blackhole.x + Math.cos(planet.angle) * planet.distance
        const py = blackhole.y + Math.sin(planet.angle) * planet.distance * 0.5

        ctx.beginPath()
        ctx.ellipse(blackhole.x, blackhole.y, planet.distance, planet.distance * 0.5, 0, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(220, 235, 255, 0.06)'
        ctx.lineWidth = 1
        ctx.stroke()

        const grad = ctx.createRadialGradient(
          px - planet.radius * 0.3, py - planet.radius * 0.3, 0,
          px, py, planet.radius
        )
        grad.addColorStop(0, planet.highlight)
        grad.addColorStop(1, planet.base)
        ctx.beginPath()
        ctx.arc(px, py, planet.radius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      // ---- 07 Gravity Particles ----
      gravityParticles.forEach((p) => {
        if (p.type === 'orbit') {
          p.orbitAngle += p.orbitSpeed
          p.x = blackhole.x + Math.cos(p.orbitAngle) * p.orbitDistance
          p.y = blackhole.y + Math.sin(p.orbitAngle) * p.orbitDistance * 0.5
        } else if (p.type === 'pull') {
          const dx = blackhole.x - p.x
          const dy = blackhole.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > blackhole.radius + 4) {
            const pull = 0.0025
            p.x += dx * pull
            p.y += dy * pull
            p.radius *= 0.999
          } else {
            resetPullParticle(p)
          }
        } else {
          p.x += p.speedX
          p.y += p.speedY
          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
          if (p.y < 0) p.y = height
          if (p.y > height) p.y = 0
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(p.radius, 0.3), 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.7
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // ---- 09 Bright Stars (drawn last so they sit on top, soft twinkle) ----
      drawStars(brightStars)

      requestAnimationFrame(draw)
    }

    draw()

    function handleResize() {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      blackhole.x = width / 2
      blackhole.y = height / 2
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <canvas ref={canvasRef} className="particle-background" />
}

export default ParticleBackground