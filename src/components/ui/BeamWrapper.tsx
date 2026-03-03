import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface BeamWrapperProps {
  children: ReactNode
  className?: string
}

export function BeamWrapper({ children, className }: BeamWrapperProps) {
  return (
    <div className={cn('relative inline-flex rounded-pill p-[1px]', className)}>
      <div
        className="absolute inset-0 rounded-pill opacity-60 animate-beam-rotate"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0%, #C4390F 25%, #B76653 50%, transparent 75%)',
        }}
        aria-hidden="true"
      />
      <div className="relative rounded-pill">{children}</div>
    </div>
  )
}
