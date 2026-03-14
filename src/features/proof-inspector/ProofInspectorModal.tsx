import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Copy, Download, ExternalLink } from 'lucide-react'
import { useTradeStore } from '@/store/tradeStore'
import { useOverlay } from '@/lib/hooks/useOverlay'
import { MOCK_PROOF } from '@/features/trade/data/mockProof'
import { StatusPill } from '@/components/ui/StatusPill'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { InfoRow } from '@/components/ui/InfoRow'
import { GhostButton } from '@/components/ui/GhostButton'
import { BeamButton } from '@/components/ui/BeamButton'
import { cn } from '@/lib/utils/cn'

type ProofTab = 'proof' | 'signals' | 'circuit'

const TABS: { id: ProofTab; label: string }[] = [
  { id: 'proof', label: 'Proof Data' },
  { id: 'signals', label: 'Public Signals' },
  { id: 'circuit', label: 'Circuit Info' },
]

export function ProofInspectorModal() {
  const { proofInspectorOpen, closeProofInspector } = useTradeStore()
  const [activeTab, setActiveTab] = useState<ProofTab>('proof')
  const { handleBackdropClick, containerRef } = useOverlay({
    isOpen: proofInspectorOpen,
    onClose: closeProofInspector,
  })

  const data = MOCK_PROOF

  return (
    <AnimatePresence>
      {proofInspectorOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-bg-base/80 backdrop-blur-md"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              ref={containerRef}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={cn(
                'flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl outline-none',
                'border border-border-default glass-surface-strong',
                'shadow-[0_0_0_1px_rgba(196,57,15,0.15),0_24px_80px_rgba(0,0,0,0.6)]',
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="proof-inspector-title"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent line */}
              <div className="h-px bg-gradient-to-r from-transparent via-orange-primary to-transparent" />

              <div className="flex items-start justify-between border-b border-border-subtle px-6 py-5">
                <div>
                  <h2 id="proof-inspector-title" className="font-heading text-sm font-semibold uppercase tracking-wide text-text-primary">
                    Proof Inspector
                  </h2>
                  <p className="mt-1 font-mono text-[11px] text-orange-warm/80">
                    {data.proofSystem} · {data.circuit} · {data.constraints.toLocaleString()} constraints
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill label="Verified" variant="success" />
                    <StatusPill label={`Block ${data.blockHeight.toLocaleString()}`} variant="neutral" dot={false} />
                    <StatusPill label={`${data.generationTime} Generation`} variant="pending" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeProofInspector}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div role="tablist" aria-label="Proof inspector sections" className="flex border-b border-border-subtle px-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`proof-tab-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    aria-controls={`proof-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative px-4 py-3 font-mono text-[11px] uppercase tracking-wider transition-colors',
                      activeTab === tab.id
                        ? 'text-text-primary'
                        : 'text-text-faint hover:text-text-muted',
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="proof-tab"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-primary"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                {TABS.map((tab) => (
                  <div
                    key={tab.id}
                    role="tabpanel"
                    id={`proof-panel-${tab.id}`}
                    aria-labelledby={`proof-tab-${tab.id}`}
                    hidden={activeTab !== tab.id}
                  >
                    {tab.id === 'proof' && <ProofDataPanel data={data} />}
                    {tab.id === 'signals' && <SignalsPanel signals={data.publicSignals} />}
                    {tab.id === 'circuit' && <CircuitPanel data={data} />}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 border-t border-border-subtle p-5">
                <GhostButton className="gap-2 border border-border-subtle">
                  <Download className="h-4 w-4" />
                  Download JSON
                </GhostButton>
                <GhostButton className="gap-2 border border-border-subtle">
                  <Copy className="h-4 w-4" />
                  Copy Hash
                </GhostButton>
                <BeamButton className="ml-auto gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View on Etherscan
                </BeamButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function ProofDataPanel({ data }: { data: typeof MOCK_PROOF }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        <MonoLabel variant="muted" size="micro" className="mb-2 block">
          Raw Proof Object
        </MonoLabel>
        <div className="relative rounded-xl border border-border-subtle bg-bg-base/80">
          <button
            type="button"
            aria-label="Copy proof"
            className="absolute right-3 top-3 text-text-faint hover:text-text-muted"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <pre className="max-h-72 overflow-auto p-4 font-mono text-[10px] leading-relaxed text-text-muted">
            {JSON.stringify(data.rawProof, null, 2)}
          </pre>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border border-border-subtle glass-surface-light p-4">
          <MonoLabel variant="muted" size="micro" className="mb-3 block">
            Verification Details
          </MonoLabel>
          <InfoRow label="Proof System" value={data.proofSystem} mono />
          <InfoRow label="Library" value={data.library} mono />
          <InfoRow label="Curve" value={data.curve} mono />
          <InfoRow label="Public Inputs" value={String(data.publicInputs)} mono />
        </div>

        <ConstraintBreakdown breakdown={data.constraintBreakdown} total={data.constraints} />
      </div>
    </div>
  )
}

function SignalsPanel({ signals }: { signals: string[] }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-base/80 p-4">
      <MonoLabel variant="muted" size="micro" className="mb-3 block">
        Public Signals
      </MonoLabel>
      <div className="space-y-2">
        {signals.map((signal, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border-subtle px-3 py-2"
          >
            <span className="font-mono text-[10px] text-text-faint">[{i}]</span>
            <span className="truncate font-mono text-xs text-orange-warm">{signal}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CircuitPanel({ data }: { data: typeof MOCK_PROOF }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border-subtle glass-surface-light p-4">
        <InfoRow label="Circuit" value={data.circuit} mono />
        <InfoRow label="Constraints" value={data.constraints.toLocaleString()} mono />
        <InfoRow label="Curve" value={data.curve} mono />
        <InfoRow label="Protocol" value="groth16" mono />
      </div>
      <ConstraintBreakdown breakdown={data.constraintBreakdown} total={data.constraints} />
    </div>
  )
}

function ConstraintBreakdown({
  breakdown,
  total,
}: {
  breakdown: typeof MOCK_PROOF.constraintBreakdown
  total: number
}) {
  return (
    <div>
      <MonoLabel variant="muted" size="micro" className="mb-3 block">
        R1CS Constraint Breakdown — {total.toLocaleString()} Total
      </MonoLabel>
      <div className="flex h-2 overflow-hidden rounded-full">
        {breakdown.map((item) => (
          <div
            key={item.label}
            style={{
              width: `${(item.count / total) * 100}%`,
              backgroundColor: item.color,
            }}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {breakdown.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-mono text-[10px] text-text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
