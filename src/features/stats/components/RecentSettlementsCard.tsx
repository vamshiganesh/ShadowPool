import { RECENT_SETTLEMENTS } from '@/features/stats/data/mockStats'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatusPill } from '@/components/ui/StatusPill'

export function RecentSettlementsCard() {
  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <h3 className="font-heading text-card-title text-text-primary">Live Settlements</h3>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-emerald-400" />
          Listening
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Tx Hash', 'Size (ETH)', 'Proof Time', 'Status'].map((col) => (
                <th
                  key={col}
                  className="px-5 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-wider text-text-faint"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_SETTLEMENTS.map((row) => (
              <tr
                key={row.txHash}
                className="border-b border-border-subtle/50 transition-colors last:border-0 hover:bg-white/[0.02]"
              >
                <td className="px-5 py-3 font-mono text-[11px] text-orange-warm/80">
                  {row.txHash}
                </td>
                <td className="px-5 py-3 font-mono text-[11px] text-text-secondary">
                  {row.size}
                </td>
                <td className="px-5 py-3 font-mono text-[11px] text-text-muted">
                  {row.proofTime}
                </td>
                <td className="px-5 py-3">
                  <StatusPill
                    label={row.status === 'settled' ? 'Settled' : 'Pending'}
                    variant={row.status === 'settled' ? 'success' : 'neutral'}
                    dot
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
