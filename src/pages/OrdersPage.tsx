import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import {
  OrdersHeader,
  OrdersFilterTabs,
  OrdersSummaryStrip,
  OrdersTable,
  type OrderFilterTab,
  type OrderRow,
} from '@/features/orders'
import { useOrdersData } from '@/lib/protocol/hooks/useProtocolData'
import { getLocalCommitment } from '@/lib/protocol/localCommitments'
import { useTradeStore } from '@/store/tradeStore'

const PAGE_SIZE = 5

export function OrdersPage() {
  const [filter, setFilter] = useState<OrderFilterTab>('all')
  const [page, setPage] = useState(1)
  const { address } = useAccount()
  const { openCommitmentDrawer, openProofInspector, setActiveCommitment } = useTradeStore()
  const { orders, filterCounts, summary } = useOrdersData(filter)

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE))
  const paged = useMemo(
    () => orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [orders, page],
  )

  const handleFilterChange = (tab: OrderFilterTab) => {
    setFilter(tab)
    setPage(1)
  }

  const handleInspect = (order: OrderRow) => {
    if (!order.commitmentHash) {
      openCommitmentDrawer()
      return
    }
    const meta = getLocalCommitment(order.commitmentHash)
    setActiveCommitment({
      hash: order.commitmentHash,
      side: order.type,
      price: meta?.price ?? order.price,
      amount: meta?.amount ?? order.size.replace(/ ETH$/, ''),
      txHash: meta?.txHash,
    })
    if (order.proofStatus === 'proving' || order.proofStatus === 'pending') {
      openProofInspector()
    } else {
      openCommitmentDrawer()
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <OrdersHeader walletAddress={address} />
      <OrdersFilterTabs active={filter} onChange={handleFilterChange} counts={filterCounts} />
      <OrdersSummaryStrip summary={summary} />
      <OrdersTable
        orders={paged}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onInspect={handleInspect}
      />
    </div>
  )
}
