import { useMemo } from 'react'
import { cn } from '@/lib/utils/cn'

interface ParticleFieldProps {
  className?: string
  count?: number
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
  duration: number
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function ParticleField({ className, count = 48 }: ParticleFieldProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: seededRandom(i * 1.1) * 100,
      y: seededRandom(i * 2.3) * 100,
      size: seededRandom(i * 3.7) * 2 + 1,
      opacity: seededRandom(i * 4.9) * 0.35 + 0.08,
      delay: seededRandom(i * 5.1) * 6,
      duration: seededRandom(i * 6.3) * 8 + 6,
    }))
  }, [count])

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-orange-warm animate-slow-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
