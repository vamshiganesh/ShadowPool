import { ExternalLink } from 'lucide-react'
import { CONTRACT_REGISTRY } from '@/features/stats/data/mockStats'
import { GlassCard } from '@/components/ui/GlassCard'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { StatusPill } from '@/components/ui/StatusPill'

export function ContractRegistryCard() {
  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="border-b border-border-subtle px-5 py-4">
        <MonoLabel variant="muted" size="micro">
          Contract Registry
        </MonoLabel>
      </div>

      <div className="divide-y divide-border-subtle">
        {CONTRACT_REGISTRY.map((contract) => (
          <div
            key={contract.address}
            className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
          >
            <div className="min-w-0">
              <p className="text-sm text-text-secondary">{contract.name}</p>
              <button
                type="button"
                className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-orange-warm/80 hover:text-orange-warm"
              >
                {contract.address}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-[10px] text-text-faint">{contract.network}</span>
              <StatusPill label="Active" variant="success" />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
