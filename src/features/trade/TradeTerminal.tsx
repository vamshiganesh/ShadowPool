import { PairHeader } from '@/components/trading/PairHeader'
import { DepthChartCard } from '@/components/trading/DepthChartCard'
import { SettlementFeedTable } from '@/components/trading/SettlementFeedTable'
import { OrderEntryPanel } from '@/components/trading/OrderEntryPanel'

export function TradeTerminal() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PairHeader />
      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
        <div className="order-2 flex min-h-0 flex-col gap-4 overflow-y-auto lg:order-1">
          <DepthChartCard />
          <SettlementFeedTable />
        </div>
        <div className="order-1 min-h-0 overflow-y-auto lg:order-2">
          <OrderEntryPanel />
        </div>
      </div>
    </div>
  )
}
