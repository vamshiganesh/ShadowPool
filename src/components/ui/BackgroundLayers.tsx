import type { ReactNode } from 'react'

interface BackgroundLayersProps {
  children: ReactNode
  showParticles?: boolean
}

export function BackgroundLayers({ children, showParticles = true }: BackgroundLayersProps) {
  return (
    <div className="app-background">
      <div className="grain-layer" aria-hidden="true" />
      {showParticles && (
        <div className="particle-layer" aria-hidden="true">
          <div className="glow-orb glow-orb--top" />
          <div
            className="glow-orb glow-orb--accent animate-slow-float"
            style={{ top: '30%', right: '10%' }}
          />
          <div
            className="glow-orb glow-orb--accent animate-slow-float"
            style={{ bottom: '20%', left: '5%', animationDelay: '2s' }}
          />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
