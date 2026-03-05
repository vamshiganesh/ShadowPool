import { cn } from '@/lib/utils/cn'

const TICKER_ITEMS = [
  { label: '24h Volume', value: '$12.4M' },
  { label: 'Active Commitments', value: '1,847' },
  { label: 'Proofs Generated', value: '3,291' },
  { label: 'Settlement Rate', value: '99.7%' },
  { label: 'Avg Proof Time', value: '2.4s' },
  { label: 'Block', value: '#19,842,103' },
] as const

interface ProtocolTickerProps {
  className?: string
}

export function ProtocolTicker({ className }: ProtocolTickerProps) {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden border-b border-border-subtle bg-bg-elevated/60',
        className,
      )}
    >
      <div className="flex h-10 items-center">
        <div className="flex animate-ticker-scroll whitespace-nowrap">
          {items.map((item, i) => (
            <span
              key={`${item.label}-${i}`}
              className="inline-flex items-center gap-2 px-6 font-mono text-[11px]"
            >
              <span className="uppercase tracking-wider text-text-faint">{item.label}</span>
              <span className="text-text-secondary">{item.value}</span>
              <span className="text-border-strong" aria-hidden="true">
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-bg-elevated/90 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-bg-elevated/90 to-transparent"
        aria-hidden="true"
      />
    </div>
  )
}
