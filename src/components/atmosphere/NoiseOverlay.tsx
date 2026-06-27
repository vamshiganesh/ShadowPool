import { cn } from '@/lib/utils/cn'

interface NoiseOverlayProps {
  className?: string
  opacity?: number
  variant?: 'default' | 'lite'
}

const NOISE_TEXTURE = {
  default:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
  lite:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
}

export function NoiseOverlay({
  className,
  opacity,
  variant = 'default',
}: NoiseOverlayProps) {
  const resolvedOpacity = opacity ?? (variant === 'lite' ? 0.022 : 0.035)

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 z-[1]', className)}
      style={{
        opacity: resolvedOpacity,
        backgroundImage: NOISE_TEXTURE[variant],
        backgroundRepeat: 'repeat',
        backgroundSize: variant === 'lite' ? '160px 160px' : '128px 128px',
      }}
      aria-hidden="true"
    />
  )
}
