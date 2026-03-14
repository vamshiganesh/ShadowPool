import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface TickerItem {
  key: string
  content: ReactNode
}

interface TickerStripProps {
  items: TickerItem[]
  className?: string
  height?: 'sm' | 'md'
  variant?: 'app' | 'landing'
}

export function TickerStrip({
  items,
  className,
  height = 'sm',
  variant = 'app',
}: TickerStripProps) {
  const doubled = [...items, ...items]
  const fadeFrom = variant === 'app' ? 'from-bg-elevated/90' : 'from-bg-elevated'

  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden="true">
      <div className={cn('flex items-center', height === 'sm' ? 'h-10' : 'h-11')}>
        <div className="flex animate-ticker-scroll whitespace-nowrap motion-reduce:animate-none">
          {doubled.map((item, i) => (
            <span key={`${item.key}-${i}`} className="inline-flex items-center px-6">
              {item.content}
            </span>
          ))}
        </div>
      </div>
      <div
        className={cn('pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r to-transparent', fadeFrom)}
      />
      <div
        className={cn('pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l to-transparent', fadeFrom)}
      />
    </div>
  )
}
