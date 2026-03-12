import { Bell, ChevronDown, Settings } from 'lucide-react'
import { MARKET_PAIR } from '@/features/trade/data/mockMarket'
import { cn } from '@/lib/utils/cn'

export function PairHeader() {
  const isNegative = MARKET_PAIR.change24h < 0

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-bg-elevated/40 px-5 py-3">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-1.5 transition-colors hover:border-border-default"
      >
        <span className="font-heading text-sm font-semibold text-text-primary">
          {MARKET_PAIR.label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
      </button>

      <div className="hidden items-center gap-6 font-mono text-[11px] md:flex">
        <Metric label="Last Price" value={MARKET_PAIR.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} />
        <Metric
          label="24h Change"
          value={`${MARKET_PAIR.change24h}%`}
          className={isNegative ? 'text-red-400' : 'text-emerald-400'}
        />
        <Metric label="24h Vol" value={`${MARKET_PAIR.volume24h} ETH`} />
      </div>

      <div className="flex items-center gap-2">
        <IconButton icon={Bell} label="Notifications" />
        <IconButton icon={Settings} label="Settings" />
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

function IconButton({
  icon: Icon,
  label,
}: {
  icon: typeof Bell
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-muted transition-colors hover:border-border-default hover:text-text-secondary"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
