import { cn } from '@/lib/utils/cn'

interface LightRaysProps {
  className?: string
}

export function LightRays({ className }: LightRaysProps) {
  return (
    <div
      className={cn('pointer-events-none fixed inset-x-0 top-0 z-0 h-[60vh] overflow-hidden', className)}
      aria-hidden="true"
    >
      <svg
        className="absolute top-0 left-1/2 h-full w-[120%] max-w-none -translate-x-1/2"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ray-gradient" x1="600" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(196, 57, 15, 0.22)" />
            <stop offset="40%" stopColor="rgba(196, 57, 15, 0.06)" />
            <stop offset="100%" stopColor="rgba(196, 57, 15, 0)" />
          </linearGradient>
          <radialGradient id="ray-fade" cx="600" cy="0" r="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="ray-mask">
            <rect width="1200" height="600" fill="url(#ray-fade)" />
          </mask>
        </defs>
        <g mask="url(#ray-mask)" opacity="0.7">
          <path d="M600 0 L480 600" stroke="url(#ray-gradient)" strokeWidth="80" />
          <path d="M600 0 L540 600" stroke="url(#ray-gradient)" strokeWidth="60" />
          <path d="M600 0 L600 600" stroke="url(#ray-gradient)" strokeWidth="100" />
          <path d="M600 0 L660 600" stroke="url(#ray-gradient)" strokeWidth="60" />
          <path d="M600 0 L720 600" stroke="url(#ray-gradient)" strokeWidth="80" />
        </g>
      </svg>
    </div>
  )
}
