import { LANDING_TICKER } from '@/lib/constants/protocol'
import { TickerStrip } from '@/components/ui/TickerStrip'
import { cn } from '@/lib/utils/cn'

interface LandingTickerSectionProps {
  className?: string
}

export function LandingTickerSection({ className }: LandingTickerSectionProps) {
  const items = LANDING_TICKER.map((item) => ({
    key: `${item.type}-${item.value}`,
    content: (
      <>
        <span className="font-mono text-[11px] uppercase tracking-wider text-orange-warm/80">
          {item.type}
        </span>
        <span className="mx-2 text-text-faint">·</span>
        <span className="font-mono text-[11px] text-text-secondary">{item.value}</span>
        <span className="mx-2 text-text-faint">·</span>
        <span
          className={cn(
            'font-mono text-[11px] uppercase tracking-wider',
            item.status === 'PENDING' ? 'text-amber-400/80' : 'text-text-muted',
          )}
        >
          {item.status}
        </span>
        <span className="ml-4 text-border-strong" aria-hidden="true">
          ·
        </span>
      </>
    ),
  }))

  return (
    <section className={cn('border-y border-border-subtle bg-bg-elevated/50', className)}>
      <TickerStrip items={items} height="md" variant="landing" />
    </section>
  )
}
