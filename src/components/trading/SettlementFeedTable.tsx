import { ExternalLink } from 'lucide-react'
import { type SettlementStatus } from '@/features/trade/data/mockSettlements'
import { useSettlementFeed } from '@/lib/protocol/hooks/useProtocolData'
import { etherscanTxUrl } from '@/lib/contracts/addresses'
import { getLocalCommitment } from '@/lib/protocol/localCommitments'
import { useTradeStore } from '@/store/tradeStore'
import { GlassCard } from '@/components/ui/GlassCard'
import { LiveDataBadge } from '@/components/ui/LiveDataBadge'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { PanelControls, ResizablePanel } from '@/components/ui/ResizablePanel'
import { StatusPill } from '@/components/ui/StatusPill'
import { cn } from '@/lib/utils/cn'

const statusVariant: Record<SettlementStatus, 'success' | 'pending' | 'info' | 'neutral'> = {
  SETTLED: 'success',
  PROVING: 'pending',
  'ON-CHAIN': 'info',
  MATCHED: 'neutral',
}

export function SettlementFeedTable() {
  const { rows } = useSettlementFeed()
  const {
    openCommitmentDrawer,
    openProofInspector,
    setActiveCommitment,
    feedPanelHeight,
    feedPanelWidth,
    feedPanelMaximized,
    setFeedPanelHeight,
    setFeedPanelWidth,
    setFeedPanelMaximized,
  } = useTradeStore()

  const openRowDetail = (commitmentHash?: `0x${string}`, txHash?: `0x${string}`) => {
    if (!commitmentHash) {
      openCommitmentDrawer()
      return
    }
    const local = getLocalCommitment(commitmentHash)
    setActiveCommitment({
      hash: commitmentHash,
      side: local?.side ?? 'buy',
      price: local?.price ?? '—',
      amount: local?.amount ?? '—',
      txHash: local?.txHash ?? txHash,
    })
    openCommitmentDrawer()
  }

  const cycleHeight = (direction: 'up' | 'down') => {
    const order = ['compact', 'default', 'tall'] as const
    const idx = order.indexOf(feedPanelHeight)
    const next =
      direction === 'up'
        ? order[Math.min(idx + 1, order.length - 1)]
        : order[Math.max(idx - 1, 0)]
    setFeedPanelHeight(next)
  }

  const feedBodyHeight =
    feedPanelHeight === 'compact'
      ? 'max-h-40'
      : feedPanelHeight === 'tall'
        ? 'max-h-[28rem]'
        : 'max-h-64'

  return (
    <ResizablePanel
      height={feedPanelHeight}
      width={feedPanelWidth}
      maximized={feedPanelMaximized}
      onHeightChange={setFeedPanelHeight}
      onWidthChange={setFeedPanelWidth}
      onMaximizedChange={setFeedPanelMaximized}
      defaultClassName="min-h-0"
      tallClassName="min-h-0"
      compactClassName="min-h-0"
    >
      <GlassCard padding="none" className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
          <MonoLabel variant="muted" size="micro">
            Live Settlement Feed
          </MonoLabel>
          <div className="flex items-center gap-3">
            <LiveDataBadge />
            <PanelControls
              height={feedPanelHeight}
              width={feedPanelWidth}
              maximized={feedPanelMaximized}
              onHeightUp={() => cycleHeight('up')}
              onHeightDown={() => cycleHeight('down')}
              onToggleWidth={() =>
                setFeedPanelWidth(feedPanelWidth === 'wide' ? 'default' : 'wide')
              }
              onToggleMaximized={() => setFeedPanelMaximized(!feedPanelMaximized)}
            />
          </div>
        </div>

        <div className={cn('overflow-auto', feedPanelMaximized ? 'flex-1' : feedBodyHeight)}>
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="border-b border-border-subtle font-mono text-[10px] uppercase tracking-wider text-text-faint">
                <th className="px-5 py-2.5 text-left font-normal">Time</th>
                <th className="px-3 py-2.5 text-left font-normal">Pair</th>
                <th className="px-3 py-2.5 text-right font-normal">Price</th>
                <th className="px-3 py-2.5 text-right font-normal">Amount</th>
                <th className="px-3 py-2.5 text-left font-normal">Status</th>
                <th className="px-5 py-2.5 text-right font-normal">Tx</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center font-mono text-[11px] text-text-faint">
                    No on-chain activity yet. Submit a commitment to see it here.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border-subtle/50 transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 font-mono text-[11px] text-text-faint">{row.time}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-text-muted">{row.pair}</td>
                    <td className="px-3 py-3 text-right font-mono text-[11px] text-text-secondary">
                      {row.price}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[11px] text-text-secondary">
                      {row.amount}
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill label={row.status} variant={statusVariant[row.status]} dot />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <a
                        href={etherscanTxUrl(row.txHashFull)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (row.status === 'PROVING') {
                            e.preventDefault()
                            openRowDetail(row.commitmentHash, row.txHashFull)
                            openProofInspector()
                          } else if (row.status !== 'SETTLED') {
                            e.preventDefault()
                            openRowDetail(row.commitmentHash, row.txHashFull)
                          }
                        }}
                        className={cn(
                          'inline-flex items-center gap-1 font-mono text-[11px] text-orange-warm/80',
                          'transition-colors hover:text-orange-warm',
                        )}
                      >
                        {row.txHash}
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </ResizablePanel>
  )
}
