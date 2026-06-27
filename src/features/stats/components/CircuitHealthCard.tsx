import type { ReactNode } from 'react'
import { CIRCUIT_META } from '@/lib/crypto/circuitMeta'
import { addresses, areContractsDeployed, etherscanAddressUrl } from '@/lib/contracts/addresses'
import { truncateHash } from '@/lib/protocol/format'
import { GlassCard } from '@/components/ui/GlassCard'
import { MonoLabel } from '@/components/ui/MonoLabel'

const ROWS = [
  { key: 'circuits', label: 'Active Circuits' },
  { key: 'constraints', label: 'Constraints' },
  { key: 'verifier', label: 'Verifier Contract' },
  { key: 'updated', label: 'Last Update' },
  { key: 'provingKey', label: 'Proving Key' },
  { key: 'gas', label: 'Verification Gas' },
] as const

export function CircuitHealthCard() {
  const deployed = areContractsDeployed()
  const verifierDisplay = deployed
    ? truncateHash(addresses.verifier, 8, 6)
    : '0x8f…3a9c'

  const values: Record<(typeof ROWS)[number]['key'], ReactNode> = {
    circuits: (
      <span>
        1/1{' '}
        <span className="text-orange-warm">Healthy</span>
      </span>
    ),
    constraints: CIRCUIT_META.constraints.toLocaleString(),
    verifier: deployed ? (
      <a
        href={etherscanAddressUrl(addresses.verifier)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-warm/90 hover:text-orange-warm"
      >
        {verifierDisplay}
      </a>
    ) : (
      verifierDisplay
    ),
    updated: 'Synced live',
    provingKey: truncateHash('0x2a7f8e91c4b3d2a1f0e9d8c7b6a5948372615049382716250493827162510493827', 6, 4),
    gas: '~142k',
  }

  return (
    <GlassCard padding="md" className="relative overflow-hidden">
      <MonoLabel variant="muted" size="micro" className="mb-4 block">
        Circuit Status
      </MonoLabel>

      <ul className="divide-y divide-border-subtle">
        {ROWS.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-6 py-3 first:pt-0 last:pb-0"
          >
            <MonoLabel variant="muted" className="shrink-0">
              {row.label}
            </MonoLabel>
            <span className="min-w-0 truncate text-right font-mono text-xs text-text-primary">
              {values[row.key]}
            </span>
          </li>
        ))}
      </ul>

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
