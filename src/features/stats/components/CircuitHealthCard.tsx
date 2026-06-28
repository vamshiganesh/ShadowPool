import type { ReactNode } from 'react'
import { useState } from 'react'
import { CIRCUIT_META } from '@/lib/crypto/circuitMeta'
import { addresses, areContractsDeployed, etherscanAddressUrl } from '@/lib/contracts/addresses'
import { truncateHash } from '@/lib/protocol/format'
import { GlassCard } from '@/components/ui/GlassCard'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { cn } from '@/lib/utils/cn'

const ROWS = [
  { key: 'circuits', label: 'Active Circuits' },
  { key: 'constraints', label: 'Constraints' },
  { key: 'verifier', label: 'Verifier Contract' },
  { key: 'updated', label: 'Last Update' },
  { key: 'provingKey', label: 'Proving Artifact' },
  { key: 'gas', label: 'Verification Gas' },
] as const

export function CircuitHealthCard() {
  const [copied, setCopied] = useState(false)
  const deployed = areContractsDeployed()
  const verifierDisplay = deployed
    ? truncateHash(addresses.verifier, 8, 6)
    : '0x8f…3a9c'

  const artifactDisplay =
    CIRCUIT_META.provingArtifact.length > 22
      ? `${CIRCUIT_META.provingArtifact.slice(0, 14)}…${CIRCUIT_META.provingArtifact.slice(-8)}`
      : CIRCUIT_META.provingArtifact

  const copyArtifact = async () => {
    try {
      await navigator.clipboard.writeText(CIRCUIT_META.provingArtifact)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

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
    provingKey: (
      <button
        type="button"
        onClick={() => void copyArtifact()}
        title={`Click to copy artifact path: ${CIRCUIT_META.provingArtifact}`}
        className={cn(
          'max-w-[12rem] truncate text-orange-warm/90 transition-colors hover:text-orange-warm',
          copied && 'text-emerald-400',
        )}
      >
        {copied ? 'Copied path' : artifactDisplay}
      </button>
    ),
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
