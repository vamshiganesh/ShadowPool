import { ExternalLink } from 'lucide-react'
import { MOCK_SETTLEMENTS, type SettlementStatus } from '@/features/trade/data/mockSettlements'
import { useTradeStore } from '@/store/tradeStore'
import { GlassCard } from '@/components/ui/GlassCard'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { StatusPill } from '@/components/ui/StatusPill'
import { cn } from '@/lib/utils/cn'

const statusVariant: Record<SettlementStatus, 'success' | 'pending' | 'info' | 'neutral'> = {
  SETTLED: 'success',
  PROVING: 'pending',
  'ON-CHAIN': 'info',
  MATCHED: 'neutral',
}

export function SettlementFeedTable() {
  const openCommitmentDrawer = useTradeStore((s) => s.openCommitmentDrawer)
  const openProofInspector = useTradeStore((s) => s.openProofInspector)

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="border-b border-border-subtle px-5 py-3">
        <MonoLabel variant="muted" size="micro">
          Live Settlement Feed
        </MonoLabel>
      </div>

      <div className="overflow-x-auto">
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
            {MOCK_SETTLEMENTS.map((row) => (
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
                  <StatusPill
                    label={row.status}
                    variant={statusVariant[row.status]}
                    dot
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (row.status === 'PROVING') openProofInspector()
                      else openCommitmentDrawer()
                    }}
                    className={cn(
                      'inline-flex items-center gap-1 font-mono text-[11px] text-orange-warm/80',
                      'transition-colors hover:text-orange-warm',
                    )}
                  >
                    {row.txHash}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
