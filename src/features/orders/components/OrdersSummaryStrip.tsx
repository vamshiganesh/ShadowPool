import { cn } from '@/lib/utils/cn'

interface OrdersSummaryStripProps {
  summary: {
    totalOrders: number | string
    totalVolume: string
    avgProofTime: string
    settlementRate: string
  }
}

export function OrdersSummaryStrip({ summary }: OrdersSummaryStripProps) {
  const METRICS = [
    { label: 'Total Orders', value: String(summary.totalOrders), key: 'orders' },
    { label: 'Total Volume', value: summary.totalVolume, key: 'volume' },
    { label: 'Avg Proof Time', value: summary.avgProofTime, key: 'proof' },
    { label: 'Settlement Rate', value: summary.settlementRate, key: 'rate' },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {METRICS.map((m) => (
        <div
          key={m.key}
          className={cn(
            'rounded-xl border border-border-subtle glass-surface px-5 py-4',
            'border-l-2 border-l-orange-primary/50',
          )}
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            {m.label}
          </p>
          <p className="mt-2 font-heading text-xl font-semibold tracking-tight text-orange-warm">
            {m.value}
          </p>
        </div>
      ))}
    </div>
  )
}
