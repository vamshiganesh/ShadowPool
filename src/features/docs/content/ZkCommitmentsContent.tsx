import { useCallback, useState } from 'react'
import { Lock, ArrowLeftRight, ShieldCheck } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import {
  DocsPageShell,
  DocsSection,
  DocsCallout,
  DocsDiagramCard,
  DocsDataTable,
  DocsNavigationFooter,
} from '@/features/docs/components'
import { CodePanel } from '@/components/marketing/CodePanel'
import { BeamButton } from '@/components/ui/BeamButton'

function pseudoHash(amount: string, price: string, nonce: string, address: string): string {
  let h = 0
  const s = `${amount}${price}${nonce}${address}`
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return `0x${h.toString(16).padStart(8, '0')}…${(h ^ 0xdeadbeef).toString(16).slice(0, 4)}`
}

export function ZkCommitmentsContent() {
  const [amount, setAmount] = useState('2.50')
  const [price, setPrice] = useState('3421.50')
  const [nonce, setNonce] = useState('847291')
  const [address, setAddress] = useState('0x71C4…4f2e')
  const [hash, setHash] = useState<string | null>(null)
  const [computing, setComputing] = useState(false)

  const compute = useCallback(() => {
    setComputing(true)
    setHash(null)
    setTimeout(() => {
      setHash(pseudoHash(amount, price, nonce, address))
      setComputing(false)
    }, 600)
  }, [amount, price, nonce, address])

  return (
    <DocsPageShell
      eyebrow="ZK Commitments"
      title="From Order to Commitment."
      description="Transforming visible trade intent into immutable, zero-knowledge cryptographic fingerprints."
    >
      <DocsSection title="What Is a Commitment?">
        <p className="mb-6 text-sm leading-relaxed text-text-secondary">
          ShadowPool replaces public order broadcast with ZK commitments. Instead of
          revealing what you want to trade, you publish a hash that cryptographically
          binds your intent — provable later, invisible now.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <DocsDiagramCard title="Traditional DEX Order">
            <CodePanel
              code={`{
  "type": "limit",
  "asset": "ETH",
  "amount": "2.50",
  "price": "3421.50",
  "maker": "0x71C4…4f2e"
}`}
              language="json"
            />
            <p className="mt-3 text-xs text-text-muted">
              Fully visible in mempool. Susceptible to front-running.
            </p>
          </DocsDiagramCard>

          <DocsDiagramCard title="ShadowPool Commitment">
            <div className="rounded-lg border border-orange-primary/25 bg-orange-primary/5 px-4 py-6 text-center">
              <p className="font-mono text-sm text-orange-warm break-all">
                0x8f9a93130…a7f6c2e4b1d09f8a3c7e2d1b0a9f8e7d6c5b4a3f2e1d0c
              </p>
            </div>
            <p className="mt-3 text-xs text-text-muted">
              Zero leakage. Cryptographically bound to the user.
            </p>
          </DocsDiagramCard>
        </div>
      </DocsSection>

      <DocsSection title="The Poseidon Hash Function">
        <div className="mb-5 rounded-xl border border-orange-primary/25 bg-bg-elevated/60 px-5 py-4 text-center">
          <p className="font-mono text-sm text-orange-warm">
            H<sub>commitment</sub> = Poseidon( assetAmount, limitPrice, nonce, address )
          </p>
        </div>

        <DocsDataTable
          columns={['Field', 'Type', 'Purpose']}
          rows={[
            ['assetAmount', 'uint256', 'Exact quantity of the asset being traded'],
            ['limitPrice', 'uint256', 'Minimum acceptable price (scaled integer)'],
            ['nonce', 'uint256', 'Unique per-order entropy preventing replay'],
            ['address', 'address', 'Ethereum address of the commitment creator'],
          ]}
        />
      </DocsSection>

      <DocsSection title="Poseidon Hash Demo">
        <DocsDiagramCard title="Local Compute">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              {(
                [
                  ['Amount (WETH)', amount, setAmount],
                  ['Limit Price (USDC)', price, setPrice],
                  ['Nonce', nonce, setNonce],
                  ['Address', address, setAddress],
                ] as const
              ).map(([label, val, setter]) => (
                <div key={label}>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-text-faint">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-bg-base/60 px-3 py-2 font-mono text-xs text-text-primary outline-none focus:border-border-orange"
                  />
                </div>
              ))}
              <BeamButton onClick={compute} disabled={computing} className="mt-2 w-full">
                {computing ? 'Computing…' : 'Compute Hash'}
              </BeamButton>
            </div>
            <div className="flex flex-col justify-center rounded-lg border border-border-subtle bg-bg-base/60 p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                Hash Output (hex)
              </p>
              <p className="mt-3 font-mono text-lg text-orange-warm">
                {hash ?? (computing ? '…' : '—')}
              </p>
              <p className="mt-2 font-mono text-[10px] text-text-faint">
                {hash ? 'Computed locally (demo)' : 'Waiting for compute…'}
              </p>
            </div>
          </div>
        </DocsDiagramCard>
      </DocsSection>

      <DocsSection title="The Commit-Reveal Protocol">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Lock, title: 'Commit', desc: 'User submits Poseidon hash on-chain. Intent is sealed.' },
            { icon: ArrowLeftRight, title: 'Match', desc: 'Off-chain matcher pairs orders without seeing plaintext.' },
            { icon: ShieldCheck, title: 'Settle', desc: 'ZK proof validates match. State transitions applied atomically.' },
          ].map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-border-subtle glass-surface-light p-5 text-center"
            >
              <step.icon className="mx-auto h-6 w-6 text-orange-warm" />
              <h3 className="mt-3 font-heading text-sm font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="What the Circuit Verifies">
        <ol className="space-y-4">
          {[
            {
              n: '01',
              title: 'Commitment Formation',
              desc: 'The Poseidon hash in the proof matches the hash of the private order inputs and salt.',
            },
            {
              n: '02',
              title: 'Order Matching Conditions',
              desc: 'Crossing orders satisfy price constraints: price_buy ≥ price_sell, with valid amounts.',
            },
            {
              n: '03',
              title: 'Sender Binding',
              desc: 'The address embedded in private inputs matches the transaction sender — no order hijacking.',
            },
          ].map((item) => (
            <li key={item.n} className="flex gap-4 rounded-xl border border-border-subtle p-4">
              <span className="font-mono text-xs text-orange-warm">{item.n}</span>
              <div>
                <p className="font-heading text-sm font-medium text-text-primary">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <DocsCallout title="All-or-Nothing Validity" variant="success">
          If any single constraint fails, proof generation aborts. There is no partial validity —
          the proof either demonstrates a correct match or does not exist.
        </DocsCallout>
      </DocsSection>

      <DocsNavigationFooter
        prev={{ label: 'The Problem', href: ROUTES.docs.problem, direction: 'prev' }}
        next={{ label: 'Circuit Diagram', href: ROUTES.docs.circuitDiagram, direction: 'next' }}
      />
    </DocsPageShell>
  )
}
