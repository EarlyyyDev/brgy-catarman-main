"use client"

import * as React from "react"

interface Particle {
  id: number
  left: number
  size: number
  duration: number
  delay: number
}

interface ParticlesProps {
  count?: number
  minSize?: number
  maxSize?: number
  glow?: boolean
  minDuration?: number
  maxDuration?: number
  glowIntensity?: number
}

export function Particles({
  count = 22,
  minSize = 2,
  maxSize = 6,
  glow = false,
  minDuration = 12,
  maxDuration = 26,
  glowIntensity = 0.45,
}: ParticlesProps) {
  const [particles, setParticles] = React.useState<Particle[]>([])

  React.useEffect(() => {
    setParticles(
      Array.from({ length: count }).map((_, id) => ({
        id,
        left: Math.random() * 100,
        size: minSize + Math.random() * (maxSize - minSize),
        duration: minDuration + Math.random() * (maxDuration - minDuration),
        delay: Math.random() * 10,
      }))
    )
  }, [count, minSize, maxSize, minDuration, maxDuration])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-gold/50"
          style={{
            left: `${p.left}%`,
            bottom: "-5%",
            width: p.size,
            height: p.size,
            boxShadow: glow ? `0 0 ${p.size * 2.5}px ${p.size * 0.8}px rgba(212,175,55,${glowIntensity})` : undefined,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
