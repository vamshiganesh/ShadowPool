import { Clock, Gavel, Shield } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import {
  DocsPageShell,
  DocsSection,
  DocsCallout,
  DocsDiagramCard,
  DocsComparisonPanel,
  DocsInlineCode,
  DocsNavigationFooter,
} from '@/features/docs/components'
import { MempoolFlowDiagram } from '@/features/docs/diagrams/MempoolFlowDiagram'

export function TheProblemContent() {
  return (
    <DocsPageShell
      eyebrow="Introduction"
      title="The Mempool is Public."
      description="Every transaction submitted to Ethereum enters a globally visible pending queue. For traders, this transparency is not neutrality, it is an attack surface."
    >
      <DocsSection>
        <p className="text-sm leading-relaxed text-text-secondary">
          When you submit a swap on a public DEX, your order details — asset pair, size,
          direction, and limit price — are broadcast in plaintext to every node in the
          network. Searchers monitor this stream continuously, extracting value through
          sandwich attacks, front-running, and back-running. This is not an edge case; it
          is the default outcome of transparent mempools during the{' '}
          <DocsInlineCode>12-second vulnerability window</DocsInlineCode> before block inclusion.
        </p>
      </DocsSection>

      <DocsSection title="Execution Flow Vulnerability">
        <DocsDiagramCard
          title="Attack Surface"
          footer="Result: Max slippage hit. Bot profit: 0.85 ETH."
        >
          <MempoolFlowDiagram />
        </DocsDiagramCard>
      </DocsSection>

      <DocsCallout title="Mathematical Certainty of Extraction" variant="warning">
        In a transparent mempool, MEV extraction is not a risk, it is a mathematical
        guarantee. Any profitable trade visible to searchers will be targeted. The only
        variable is how much value is extracted, not whether extraction occurs.
      </DocsCallout>

      <DocsSection title="Existing Mitigations Fall Short">
        <DocsComparisonPanel
          items={[
            {
              title: 'Private Mempools',
              icon: <Shield className="h-4 w-4" />,
              pros: ['Hidden from public view', 'Reduced front-running'],
              cons: ['Centralization risk', 'Trust in relay operator'],
            },
            {
              title: 'Time-Lock Encryption',
              icon: <Clock className="h-4 w-4" />,
              pros: ['Cryptographic safety', 'No trusted party'],
              cons: ['Poor UX for trading', 'Latency overhead'],
            },
            {
              title: 'Batch Auctions',
              icon: <Gavel className="h-4 w-4" />,
              pros: ['Uniform clearing price', 'MEV internalization'],
              cons: ['Complex solver networks', 'Delayed execution'],
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Zero-Knowledge Changes the Equation">
        <p className="text-sm leading-relaxed text-text-secondary">
          ShadowPool replaces visible order broadcast with{' '}
          <DocsInlineCode>Poseidon commitments</DocsInlineCode>, cryptographic fingerprints
          that bind order intent without revealing it. A Groth16 proof demonstrates that a
          match is valid without exposing the underlying inputs. Settlement is atomic:
          funds move only if the proof verifies on-chain.
        </p>
      </DocsSection>

      <DocsNavigationFooter
        next={{ label: 'ZK Commitments', href: ROUTES.docs.zkCommitments, direction: 'next' }}
      />
    </DocsPageShell>
  )
}
