import { Code2 } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import {
  DocsPageShell,
  DocsSection,
  DocsDiagramCard,
  DocsDataTable,
  DocsNavigationFooter,
} from '@/features/docs/components'
import { CircuitDiagram } from '@/features/docs/diagrams/CircuitDiagram'
import { CodePanel } from '@/components/marketing/CodePanel'
import { StatusPill } from '@/components/ui/StatusPill'

const CONSTRAINT_BREAKDOWN = [
  { label: 'Poseidon Hash', pct: 34, color: '#C4390F' },
  { label: 'Range Checks', pct: 22, color: '#B76653' },
  { label: 'Price Validation', pct: 21, color: '#AA2608' },
  { label: 'Signature Verify', pct: 15, color: 'rgba(245,240,238,0.2)' },
  { label: 'Nullifier', pct: 8, color: 'rgba(245,240,238,0.1)' },
]

const CIRCUIT_CODE = `pragma circom 2.0.0;

include "poseidon.circom";

template ShadowPoolMatch() {
    signal input amount_a;
    signal input price_a;
    signal input salt_a;
    signal input amount_b;
    signal input price_b;
    signal input salt_b;

    signal output commitment_a;
    signal output commitment_b;
    signal output match_valid;

    component hash_a = Poseidon(4);
    component hash_b = Poseidon(4);

    hash_a.inputs[0] <== amount_a;
    hash_a.inputs[1] <== price_a;
    hash_a.inputs[2] <== salt_a;

    commitment_a <== hash_a.out;
    match_valid <== price_a >= price_b ? 1 : 0;
}

component main { public [commitment_a, commitment_b, match_valid] }`

export function CircuitDiagramContent() {
  return (
    <DocsPageShell
      eyebrow="Circuit"
      title="Circuit Diagram"
      description="The shadowpool_match circuit expresses match validity as R1CS constraints verifiable via Groth16."
      meta={
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
            <Code2 className="h-3.5 w-3.5 text-orange-warm" />
            shadowpool_match.circom — Groth16 · 18,432 R1CS · 18,849 wires
          </span>
          <StatusPill label="18,432 Constraints" variant="pending" />
          <StatusPill label="4 Public Inputs" variant="info" />
          <StatusPill label="Groth16" variant="neutral" dot={false} />
        </div>
      }
      wide
    >
      <DocsSection>
        <DocsDiagramCard title="shadowpool_match.circom">
          <CircuitDiagram />
        </DocsDiagramCard>
      </DocsSection>

      <DocsSection title="Constraint Breakdown">
        <div className="flex h-2.5 overflow-hidden rounded-full">
          {CONSTRAINT_BREAKDOWN.map((c) => (
            <div
              key={c.label}
              style={{ width: `${c.pct}%`, backgroundColor: c.color }}
              title={`${c.label}: ${c.pct}%`}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {CONSTRAINT_BREAKDOWN.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="font-mono text-[10px] text-text-muted">
                {c.label} ({c.pct}%)
              </span>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Signal Reference">
        <DocsDataTable
          columns={['Signal', 'Visibility', 'Description']}
          rows={[
            ['amount_a, price_a, salt_a', 'Private', 'Order A inputs — never revealed on-chain'],
            ['amount_b, price_b, salt_b', 'Private', 'Order B inputs — never revealed on-chain'],
            ['commitment_a', 'Public', 'On-chain Poseidon hash for order A'],
            ['commitment_b', 'Public', 'On-chain Poseidon hash for order B'],
            ['match_valid', 'Public', 'Boolean: 1 if price and amount constraints satisfied'],
          ]}
        />
      </DocsSection>

      <DocsSection title="Circuit Source">
        <CodePanel code={CIRCUIT_CODE} language="circom" />
      </DocsSection>

      <DocsNavigationFooter
        prev={{ label: 'ZK Commitments', href: ROUTES.docs.zkCommitments, direction: 'prev' }}
      />
    </DocsPageShell>
  )
}
