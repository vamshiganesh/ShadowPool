import { PROTOCOL_TICKER } from '@/lib/constants/protocol'
import { TickerStrip } from '@/components/ui/TickerStrip'
import { cn } from '@/lib/utils/cn'

interface ProtocolTickerProps {
  className?: string
}

export function ProtocolTicker({ className }: ProtocolTickerProps) {
  const items = PROTOCOL_TICKER.map((item) => ({
    key: item.label,
    content: (
      <>
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-faint">
          {item.label}
        </span>
        <span className="ml-2 font-mono text-[11px] text-text-secondary">{item.value}</span>
        <span className="ml-4 text-border-strong" aria-hidden="true">
          ·
        </span>
      </>
    ),
  }))

  return (
    <TickerStrip
      items={items}
      variant="app"
      className={cn('shrink-0 border-b border-border-subtle bg-bg-elevated/60', className)}
    />
  )
}
