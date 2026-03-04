import type { ReactNode } from 'react'
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
  glowIntensity?: 'subtle' | 'default' | 'strong'
}

export function AtmosphereStack({
  children,
  className,
  rays = true,
  particles = true,
  glowIntensity = 'default',
}: AtmosphereStackProps) {
  return (
    <div className={cn('relative min-h-screen bg-bg-base', className)}>
      <BackgroundGlow intensity={glowIntensity} />
      {rays && <LightRays />}
      {particles && <ParticleField />}
      <NoiseOverlay />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
