import { cn } from '@/lib/utils/cn'

interface BackgroundGlowProps {
  className?: string
  intensity?: 'subtle' | 'default' | 'strong'
}

const intensityOpacity = {
  subtle: 0.18,
  default: 0.28,
  strong: 0.38,
}

export function BackgroundGlow({ className, intensity = 'default' }: BackgroundGlowProps) {
  const opacity = intensityOpacity[intensity]

  return (
    <div
      className={cn('pointer-events-none absolute inset-0', className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 45% at 50% -15%, rgba(196, 57, 15, ${opacity}) 0%, rgba(170, 38, 8, ${opacity * 0.3}) 35%, transparent 70%)`,
        }}
      />
      <div
        className="absolute top-0 left-1/2 h-[50vh] w-[70vw] -translate-x-1/2"
        style={{
          background: `radial-gradient(ellipse at center top, rgba(183, 102, 83, ${opacity * 0.25}) 0%, transparent 65%)`,
        }}
      />
    </div>
  )
}
