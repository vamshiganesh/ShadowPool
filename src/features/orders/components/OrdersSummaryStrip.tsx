import { ORDER_SUMMARY } from '@/features/orders/data/mockOrders'
import { cn } from '@/lib/utils/cn'

const METRICS = [
  { label: 'Total Orders', value: ORDER_SUMMARY.totalOrders, key: 'orders' },
  { label: 'Total Volume', value: ORDER_SUMMARY.totalVolume, key: 'volume' },
  { label: 'Avg Proof Time', value: ORDER_SUMMARY.avgProofTime, key: 'proof' },
  { label: 'Settlement Rate', value: ORDER_SUMMARY.settlementRate, key: 'rate' },
] as const

export function OrdersSummaryStrip() {
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
