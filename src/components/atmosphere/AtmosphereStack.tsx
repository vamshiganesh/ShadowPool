import type { ReactNode } from 'react'
import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { useSyncedScrollY } from '@/lib/hooks/useSyncedScrollY'
import { cn } from '@/lib/utils/cn'
import { BackgroundGlow } from './BackgroundGlow'
import { LightRays } from './LightRays'
import { ParticleField } from './ParticleField'
import { NoiseOverlay } from './NoiseOverlay'

interface AtmosphereStackProps {
  children: ReactNode
  className?: string
  rays?: boolean
  particles?: boolean
  particleCount?: number
  particleDensity?: 'default' | 'light'
  glowIntensity?: 'subtle' | 'default' | 'strong'
  noise?: 'default' | 'lite'
}

export function AtmosphereStack({
  children,
  className,
  rays = true,
  particles = true,
  particleCount = 32,
  particleDensity = 'default',
  glowIntensity = 'default',
  noise = 'default',
}: AtmosphereStackProps) {
  const reduceMotion = useReducedMotion()
  const scrollY = useSyncedScrollY()
  const liftY = useTransform(scrollY, [0, 900], reduceMotion ? [0, 0] : [0, -320])

  return (
    <div className={cn('relative min-h-screen bg-bg-base', className)}>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[85vh] will-change-transform"
        style={{ y: reduceMotion ? undefined : liftY }}
        aria-hidden="true"
      >
        <BackgroundGlow intensity={glowIntensity} />
        {rays && <LightRays />}
      </motion.div>
      {particles && (
        <ParticleField count={particleCount} density={particleDensity} />
      )}
      <NoiseOverlay variant={noise} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
