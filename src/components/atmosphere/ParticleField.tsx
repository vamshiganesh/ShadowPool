import { useMemo, type CSSProperties } from 'react'
import { cn } from '@/lib/utils/cn'

interface ParticleFieldProps {
  className?: string
  count?: number
  density?: 'default' | 'light'
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
  duration: number
  drift: CSSProperties
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function driftOffset(seed: number, range: number) {
  return Math.round((seededRandom(seed) - 0.5) * range)
}

function buildDriftStyle(index: number, duration: number, delay: number): CSSProperties {
  return {
    ['--drift-x1' as string]: `${driftOffset(index * 8.1, 120)}px`,
    ['--drift-y1' as string]: `${driftOffset(index * 9.2, 140)}px`,
    ['--drift-x2' as string]: `${driftOffset(index * 10.3, 160)}px`,
    ['--drift-y2' as string]: `${driftOffset(index * 11.4, 180)}px`,
    ['--drift-x3' as string]: `${driftOffset(index * 12.5, 130)}px`,
    ['--drift-y3' as string]: `${driftOffset(index * 13.6, 150)}px`,
    ['--drift-duration' as string]: `${duration}s`,
    animationDelay: `${delay}s`,
  }
}

export function ParticleField({
  className,
  count = 48,
  density = 'default',
}: ParticleFieldProps) {
  const isLight = density === 'light'

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const duration = isLight
        ? seededRandom(i * 6.3) * 18 + 28
        : seededRandom(i * 6.3) * 8 + 6
      const delay = seededRandom(i * 5.1) * (isLight ? 12 : 6)

      return {
        id: i,
        x: seededRandom(i * 1.1) * 100,
        y: seededRandom(i * 2.3) * 100,
        size: isLight
          ? seededRandom(i * 3.7) * 2.5 + 2.5
          : seededRandom(i * 3.7) * 2 + 1,
        opacity: isLight
          ? seededRandom(i * 4.9) * 0.16 + 0.18
          : seededRandom(i * 4.9) * 0.35 + 0.08,
        delay,
        duration,
        drift: isLight ? buildDriftStyle(i, duration, delay) : {},
      }
    })
  }, [count, isLight])

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 z-[2] overflow-hidden', className)}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn(
            'absolute rounded-full bg-orange-warm shadow-[0_0_10px_rgba(196,57,15,0.45)]',
            isLight ? 'animate-landing-particle' : 'animate-slow-float',
          )}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            ...(!isLight && {
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }),
            ...(isLight && p.drift),
          }}
        />
      ))}
    </div>
  )
}
