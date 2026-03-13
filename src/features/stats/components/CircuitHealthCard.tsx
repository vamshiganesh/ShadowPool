import { CIRCUIT_HEALTH } from '@/features/stats/data/mockStats'
import { GlassCard } from '@/components/ui/GlassCard'
import { InfoRow } from '@/components/ui/InfoRow'
import { MonoLabel } from '@/components/ui/MonoLabel'

export function CircuitHealthCard() {
  const data = CIRCUIT_HEALTH

  return (
    <GlassCard padding="md" className="relative overflow-hidden">
      <MonoLabel variant="muted" size="micro" className="mb-4 block">
        Circuit Status
      </MonoLabel>

      <div className="grid gap-0 sm:grid-cols-2">
        <InfoRow
          label="Active Circuits"
          value={
            <span>
              {data.activeCircuits}{' '}
              <span className="text-orange-warm">{data.healthStatus}</span>
            </span>
          }
        />
        <InfoRow label="Constraints" value={data.constraints} mono />
        <InfoRow label="Verifier Contract" value={data.verifierContract} mono />
        <InfoRow label="Last Update" value={data.lastUpdate} />
        <InfoRow label="Proving Key" value={data.provingKeyHash} mono />
        <InfoRow label="Verification Gas" value={data.verificationGas} mono />
      </div>

      {/* Decorative circuit diagram */}
      <svg
        className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 opacity-20"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="8" fill="#C4390F" />
        <circle cx="20" cy="30" r="4" fill="#B76653" />
        <circle cx="80" cy="30" r="4" fill="#B76653" />
        <circle cx="20" cy="70" r="4" fill="#B76653" />
        <circle cx="80" cy="70" r="4" fill="#B76653" />
        <line x1="50" y1="50" x2="20" y2="30" stroke="#C4390F" strokeWidth="0.5" />
        <line x1="50" y1="50" x2="80" y2="30" stroke="#C4390F" strokeWidth="0.5" />
        <line x1="50" y1="50" x2="20" y2="70" stroke="#C4390F" strokeWidth="0.5" />
        <line x1="50" y1="50" x2="80" y2="70" stroke="#C4390F" strokeWidth="0.5" />
      </svg>
    </GlassCard>
  )
}
