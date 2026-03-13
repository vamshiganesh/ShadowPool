import { useMemo, useState } from 'react'
import {
  OrdersHeader,
  OrdersFilterTabs,
  OrdersSummaryStrip,
  OrdersTable,
  MOCK_ORDERS,
  filterOrders,
  type OrderFilterTab,
  type OrderRow,
} from '@/features/orders'
import { useTradeStore } from '@/store/tradeStore'
import { CommitmentDetailDrawer } from '@/features/trade/overlays/CommitmentDetailDrawer'
import { ProofInspectorModal } from '@/features/proof-inspector/ProofInspectorModal'

const PAGE_SIZE = 5

export function OrdersPage() {
  const [filter, setFilter] = useState<OrderFilterTab>('all')
  const [page, setPage] = useState(1)
  const { openCommitmentDrawer, openProofInspector } = useTradeStore()

  const filtered = useMemo(() => filterOrders(MOCK_ORDERS, filter), [filter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilterChange = (tab: OrderFilterTab) => {
    setFilter(tab)
    setPage(1)
  }

  const handleInspect = (order: OrderRow) => {
    if (order.proofStatus === 'proving' || order.proofStatus === 'pending') {
      openProofInspector()
    } else {
      openCommitmentDrawer()
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <OrdersHeader />
      <OrdersFilterTabs active={filter} onChange={handleFilterChange} />
      <OrdersSummaryStrip />
      <OrdersTable
        orders={paged}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onInspect={handleInspect}
      />

      <CommitmentDetailDrawer />
      <ProofInspectorModal />
    </div>
  )
}
