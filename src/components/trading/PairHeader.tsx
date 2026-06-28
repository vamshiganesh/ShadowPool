import { useMarketData } from '@/lib/protocol/hooks/useMarketData'
import { cn } from '@/lib/utils/cn'

export function PairHeader() {
  const { market } = useMarketData()
  const isNegative = market.change24h < 0

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-bg-elevated/40 px-5 py-3">
      <div className="rounded-lg border border-border-subtle px-3 py-1.5">
        <span className="font-heading text-sm font-semibold text-text-primary">
          {market.label}
        </span>
      </div>

      <div className="flex items-center gap-6 font-mono text-[11px] md:flex">
        <Metric label="Last Price" value={market.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} />
        <Metric
          label="24h Change"
          value={`${market.change24h}%`}
          className={isNegative ? 'text-red-400' : 'text-emerald-400'}
        />
        <Metric label="24h Vol" value={`${market.volume24h} ETH`} />
      </div>
    </header>
  )
}

function Metric({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="uppercase tracking-wider text-text-faint">{label}</span>
      <span className={cn('text-text-secondary', className)}>{value}</span>
    </div>
  )
}
