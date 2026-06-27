import { useMemo } from 'react'
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

/** Repeat items so one loop segment is wide enough to cover ultra-wide viewports. */
const MIN_SEQUENCE_ITEMS = 16

function buildSequence(items: TickerItem[]): TickerItem[] {
  if (items.length === 0) return []

  const repeatCount = Math.max(1, Math.ceil(MIN_SEQUENCE_ITEMS / items.length))
  const sequence: TickerItem[] = []

  for (let r = 0; r < repeatCount; r += 1) {
    for (let i = 0; i < items.length; i += 1) {
      sequence.push({
        key: `${items[i].key}-${r}-${i}`,
        content: items[i].content,
      })
    }
  }

  return sequence
}

export function TickerStrip({
  items,
  className,
  height = 'sm',
  variant = 'app',
}: TickerStripProps) {
  const loop = useMemo(() => {
    const sequence = buildSequence(items)
    return [
      ...sequence,
      ...sequence.map((item) => ({ ...item, key: `${item.key}-dup` })),
    ]
  }, [items])

  const fadeFrom = variant === 'app' ? 'from-bg-elevated/90' : 'from-bg-elevated'
  const duration = Math.max(loop.length * 2.8, 40)

  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden="true">
      <div className={cn('flex items-center', height === 'sm' ? 'h-10' : 'h-11')}>
        <div
          className="flex w-max animate-ticker-scroll whitespace-nowrap will-change-transform motion-reduce:animate-none"
          style={{ animationDuration: `${duration}s` }}
        >
          {loop.map((item) => (
            <span key={item.key} className="inline-flex shrink-0 items-center px-6">
              {item.content}
            </span>
          ))}
        </div>
      </div>
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r to-transparent',
          fadeFrom,
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l to-transparent',
          fadeFrom,
        )}
      />
    </div>
  )
}
