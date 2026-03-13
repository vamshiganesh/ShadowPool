import { ExternalLink } from 'lucide-react'
import type { OrderRow } from '@/features/orders/data/mockOrders'
import { StatusPill } from '@/components/ui/StatusPill'
import { GhostButton } from '@/components/ui/GhostButton'
import { cn } from '@/lib/utils/cn'

interface OrdersTableRowProps {
  order: OrderRow
  onInspect: () => void
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'neutral' as const },
  proving: { label: 'Proving', variant: 'pending' as const },
  settled: { label: 'Settled', variant: 'success' as const },
  failed: { label: 'Failed', variant: 'error' as const },
}

export function OrdersTableRow({ order, onInspect }: OrdersTableRowProps) {
  const isProving = order.proofStatus === 'proving'
  const status = statusConfig[order.proofStatus]

  return (
    <tr
      className={cn(
        'border-b border-border-subtle/50 transition-colors last:border-0',
        isProving && 'bg-orange-primary/[0.06]',
        !isProving && 'hover:bg-white/[0.02]',
      )}
    >
      <td className="px-5 py-4 font-mono text-[11px] text-text-secondary">{order.id}</td>
      <td className="px-4 py-4">
        <span
          className={cn(
            'font-mono text-[11px] uppercase',
            order.type === 'buy' ? 'text-emerald-400' : 'text-red-400',
          )}
        >
          {order.type}
        </span>
      </td>
      <td className="px-4 py-4 font-mono text-[11px] text-text-muted">{order.pair}</td>
      <td className="px-4 py-4 font-mono text-[11px] text-text-secondary">{order.size}</td>
      <td className="px-4 py-4 font-mono text-[11px] text-text-secondary">{order.price}</td>
      <td className="px-4 py-4 font-mono text-[11px] text-text-faint">{order.submitted}</td>
      <td className="px-4 py-4">
        <div className="space-y-1">
          <StatusPill label={status.label} variant={status.variant} dot />
          {isProving && order.proofElapsed && (
            <p className="font-mono text-[10px] text-orange-warm/80">
              Generating proof… {order.proofElapsed} elapsed
            </p>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        {order.settlementTx ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 font-mono text-[11px] text-orange-warm/80 hover:text-orange-warm"
          >
            {order.settlementTx}
            <ExternalLink className="h-3 w-3 opacity-50" />
          </button>
        ) : (
          <span className="font-mono text-[11px] text-text-faint">—</span>
        )}
      </td>
      <td className="px-5 py-4">
        <GhostButton
          size="sm"
          onClick={onInspect}
          className={cn(
            'font-mono text-[10px] uppercase tracking-wider',
            isProving && 'border border-orange-primary/30 text-orange-warm hover:bg-orange-primary/10',
          )}
        >
          Inspect
        </GhostButton>
      </td>
    </tr>
  )
}
