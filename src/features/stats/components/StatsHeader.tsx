import { RefreshCw } from 'lucide-react'
import type { StatsTimeRange } from '@/features/stats/data/mockStats'
import { cn } from '@/lib/utils/cn'

const RANGES: { id: StatsTimeRange; label: string }[] = [
  { id: '1h', label: '1H' },
  { id: '24h', label: '24H' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: 'all', label: 'ALL' },
]

interface StatsHeaderProps {
  timeRange: StatsTimeRange
  onTimeRangeChange: (range: StatsTimeRange) => void
}

export function StatsHeader({ timeRange, onTimeRangeChange }: StatsHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-heading text-page-headline text-text-primary">Protocol Stats</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live on Sepolia Testnet
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-faint">
            <RefreshCw className="h-3 w-3" />
            Updated every block (~12s)
          </span>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border border-border-subtle glass-surface-light p-1">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onTimeRangeChange(r.id)}
            className={cn(
              'rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
              timeRange === r.id
                ? 'bg-orange-primary/20 text-orange-warm'
                : 'text-text-faint hover:text-text-muted',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
