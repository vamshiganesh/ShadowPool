import type { OrderFilterTab } from '@/features/orders/data/mockOrders'
import { FILTER_COUNTS } from '@/features/orders/data/mockOrders'
import { cn } from '@/lib/utils/cn'

const TABS: { id: OrderFilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'proving', label: 'Proving' },
  { id: 'settled', label: 'Settled' },
]

interface OrdersFilterTabsProps {
  active: OrderFilterTab
  onChange: (tab: OrderFilterTab) => void
}

export function OrdersFilterTabs({ active, onChange }: OrdersFilterTabsProps) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border-subtle glass-surface-light p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-lg px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-all',
            active === tab.id
              ? 'bg-orange-primary/15 text-orange-warm'
              : 'text-text-muted hover:text-text-secondary',
          )}
        >
          {tab.label}
          <span className="ml-1.5 text-text-faint">({FILTER_COUNTS[tab.id]})</span>
        </button>
      ))}
    </div>
  )
}
