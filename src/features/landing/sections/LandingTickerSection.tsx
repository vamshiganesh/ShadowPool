import { cn } from '@/lib/utils/cn'
import { LANDING_TICKER_ITEMS } from '@/features/landing/data'

interface LandingTickerSectionProps {
  className?: string
}

export function LandingTickerSection({ className }: LandingTickerSectionProps) {
  const items = [...LANDING_TICKER_ITEMS, ...LANDING_TICKER_ITEMS]

  return (
    <section
      className={cn(
        'relative overflow-hidden border-y border-border-subtle bg-bg-elevated/50',
        className,
      )}
    >
      <div className="flex h-11 items-center">
        <div className="flex animate-ticker-scroll whitespace-nowrap">
          {items.map((item, i) => (
            <span
              key={`${item.type}-${i}`}
              className="inline-flex items-center gap-2 px-8 font-mono text-[11px]"
            >
              <span className="uppercase tracking-wider text-orange-warm/80">{item.type}</span>
              <span className="text-text-faint">·</span>
              <span className="text-text-secondary">{item.value}</span>
              <span className="text-text-faint">·</span>
              <span
                className={cn(
                  'uppercase tracking-wider',
                  item.status === 'PENDING' ? 'text-amber-400/80' : 'text-text-muted',
                )}
              >
                {item.status}
              </span>
              <span className="ml-4 text-border-strong" aria-hidden="true">
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg-elevated to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg-elevated to-transparent"
        aria-hidden="true"
      />
    </section>
  )
}
