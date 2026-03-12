import { PairHeader } from '@/components/trading/PairHeader'
import { DepthChartCard } from '@/components/trading/DepthChartCard'
import { SettlementFeedTable } from '@/components/trading/SettlementFeedTable'
import { OrderEntryPanel } from '@/components/trading/OrderEntryPanel'
import { CommitmentDetailDrawer } from '@/features/trade/overlays/CommitmentDetailDrawer'
import { ProofInspectorModal } from '@/features/proof-inspector/ProofInspectorModal'

export function TradeTerminal() {
  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        <PairHeader />
        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
            <DepthChartCard />
            <SettlementFeedTable />
          </div>
          <div className="min-h-0 overflow-y-auto">
            <OrderEntryPanel />
          </div>
        </div>
      </div>

      <CommitmentDetailDrawer />
      <ProofInspectorModal />
    </>
  )
}
