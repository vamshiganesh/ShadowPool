import { PairHeader } from '@/components/trading/PairHeader'
import { DepthChartCard } from '@/components/trading/DepthChartCard'
import { SettlementFeedTable } from '@/components/trading/SettlementFeedTable'
import { OrderEntryPanel } from '@/components/trading/OrderEntryPanel'
import { useTradeStore } from '@/store/tradeStore'
import { cn } from '@/lib/utils/cn'

export function TradeTerminal() {
  const depthPanelWidth = useTradeStore((s) => s.depthPanelWidth)
  const feedPanelWidth = useTradeStore((s) => s.feedPanelWidth)
  const chartsExpanded = depthPanelWidth === 'wide' || feedPanelWidth === 'wide'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PairHeader />
      <div
        className={cn(
          'grid min-h-0 flex-1 auto-rows-min gap-4 overflow-auto p-4',
          chartsExpanded
            ? 'grid-cols-1'
            : 'lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]',
        )}
      >
        <div
          className={cn(
            chartsExpanded
              ? 'order-1'
              : 'order-2 lg:order-none lg:col-start-1 lg:row-start-1',
          )}
        >
          <DepthChartCard />
        </div>

        <div
          className={cn(
            chartsExpanded
              ? 'order-2'
              : 'order-3 lg:order-none lg:col-start-1 lg:row-start-2',
          )}
        >
          <SettlementFeedTable />
        </div>

        <div
          className={cn(
            'min-h-0',
            chartsExpanded
              ? 'order-3'
              : 'order-1 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1',
          )}
        >
          <OrderEntryPanel />
        </div>
      </div>
    </div>
  )
}
