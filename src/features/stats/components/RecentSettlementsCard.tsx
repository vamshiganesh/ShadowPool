import { ExternalLink } from 'lucide-react'
import { RECENT_SETTLEMENTS } from '@/features/stats/data/mockStats'
import { addresses, areContractsDeployed, etherscanAddressUrl } from '@/lib/contracts/addresses'
import { truncateHash } from '@/lib/protocol/format'
import { GlassCard } from '@/components/ui/GlassCard'
import { LiveDataBadge } from '@/components/ui/LiveDataBadge'
import { StatusPill } from '@/components/ui/StatusPill'

interface LiveSettlementRow {
  txHash: string
  size: string
  proofTime: string
  status: 'settled' | 'pending'
}

interface RecentSettlementsCardProps {
  liveRows?: LiveSettlementRow[] | null
}

export function RecentSettlementsCard({ liveRows }: RecentSettlementsCardProps) {
  const rows = liveRows ?? RECENT_SETTLEMENTS

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <h3 className="font-heading text-card-title text-text-primary">Live Settlements</h3>
        <LiveDataBadge />
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center font-mono text-[11px] text-text-faint">
                  No settlements indexed yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}

export function ContractRegistryCard() {
  const deployed = areContractsDeployed()

  const contracts = deployed
    ? [
        { name: 'OrderBook', address: addresses.orderBook },
        { name: 'DarkPool Settlement', address: addresses.settlement },
        { name: 'Groth16 Verifier', address: addresses.verifier },
      ]
    : []

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
          Contract Registry
        </span>
        <LiveDataBadge />
      </div>

      <div className="divide-y divide-border-subtle">
        {!deployed ? (
          <p className="px-5 py-6 font-mono text-[11px] text-text-faint">
            Deploy contracts to Sepolia to populate the registry. See DEPLOY.md.
          </p>
        ) : (
          contracts.map((contract) => (
            <div
              key={contract.address}
              className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
            >
              <div className="min-w-0">
                <p className="text-sm text-text-secondary">{contract.name}</p>
                <a
                  href={etherscanAddressUrl(contract.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-orange-warm/80 hover:text-orange-warm"
                >
                  {truncateHash(contract.address, 8, 6)}
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-[10px] text-text-faint">Sepolia</span>
                <StatusPill label="Active" variant="success" />
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  )
}
