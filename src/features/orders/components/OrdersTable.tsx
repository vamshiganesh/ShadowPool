import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { OrderRow } from '@/features/orders/data/mockOrders'
import { OrdersTableRow } from '@/features/orders/components/OrdersTableRow'
import { PaginationPills } from '@/features/orders/components/PaginationPills'
import { GlassCard } from '@/components/ui/GlassCard'
import { MonoLabel } from '@/components/ui/MonoLabel'

interface OrdersTableProps {
  orders: OrderRow[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onInspect: (order: OrderRow) => void
}

const COLUMNS = [
  'Order ID',
  'Type',
  'Pair',
  'Size',
  'Price',
  'Submitted',
  'Proof Status',
  'Settlement Tx',
  'Actions',
] as const

export function OrdersTable({
  orders,
  page,
  totalPages,
  onPageChange,
  onInspect,
}: OrdersTableProps) {
  if (orders.length === 0) {
    return <OrdersEmptyState />
  }

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border-subtle">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-mono text-[10px] font-normal uppercase tracking-wider text-text-faint first:pl-5 last:pr-5"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrdersTableRow key={order.id} order={order} onInspect={() => onInspect(order)} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border-subtle px-5 py-4">
        <PaginationPills page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </GlassCard>
  )
}

function OrdersEmptyState() {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated/60">
        <Search className="h-5 w-5 text-text-faint" />
      </div>
      <MonoLabel variant="muted" className="mb-2">
        No orders found
      </MonoLabel>
      <p className="max-w-xs text-sm text-text-muted">
        No commitments match this filter. Submit an order from the trading terminal to get started.
      </p>
    </GlassCard>
  )
}

export { ChevronLeft, ChevronRight }
