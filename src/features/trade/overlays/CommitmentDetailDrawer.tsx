import { AnimatePresence, motion } from 'framer-motion'
import { X, Copy, ShieldCheck, ExternalLink, ChevronRight } from 'lucide-react'
import { useTradeStore } from '@/store/tradeStore'
import { useOverlay } from '@/lib/hooks/useOverlay'
import { MOCK_COMMITMENT } from '@/features/trade/data/mockCommitment'
import { StatusPill } from '@/components/ui/StatusPill'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { InfoRow } from '@/components/ui/InfoRow'
import { Divider } from '@/components/ui/Divider'
import { GhostButton } from '@/components/ui/GhostButton'
import { BeamButton } from '@/components/ui/BeamButton'
import { cn } from '@/lib/utils/cn'

export function CommitmentDetailDrawer() {
  const { commitmentDrawerOpen, closeCommitmentDrawer, openProofInspector } = useTradeStore()
  const { handleBackdropClick } = useOverlay({
    isOpen: commitmentDrawerOpen,
    onClose: closeCommitmentDrawer,
  })

  const data = MOCK_COMMITMENT

  return (
    <AnimatePresence>
      {commitmentDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg-base/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col',
              'border-l border-orange-primary/20 glass-surface-strong shadow-[-16px_0_48px_rgba(0,0,0,0.5)]',
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Commitment detail"
          >
            <CommitmentDrawerHeader onClose={closeCommitmentDrawer} hash={data.hash} />

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="mb-5 flex flex-wrap gap-2">
                <StatusPill label="Settled" variant="success" />
                <StatusPill label={data.proofSystem} variant="pending" />
                <StatusPill label={`Block ${data.blockHeight.toLocaleString()}`} variant="neutral" dot={false} />
              </div>

              <section className="mb-6">
                <MonoLabel variant="muted" size="micro" className="mb-3 block">
                  Transaction Parameters
                </MonoLabel>
                <div className="rounded-xl border border-border-subtle glass-surface-light p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <ParamCell label="Asset Pair" value={data.pair} />
                    <ParamCell
                      label="Direction"
                      value={data.direction === 'buy' ? '↓ Buy' : '↑ Sell'}
                      accent
                    />
                    <ParamCell label="Execution Size" value={data.size} />
                    <ParamCell label="Settlement Price" value={data.price} />
                  </div>
                  <Divider spacing="sm" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                    Notional Value
                  </p>
                  <p className="mt-1 font-heading text-2xl font-semibold text-orange-warm">
                    {data.notional}
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <MonoLabel variant="muted" size="micro" className="mb-3 block">
                  Zero-Knowledge Proof
                </MonoLabel>
                <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-4">
                  <InfoRow label="Proving System" value={data.provingSystem} mono />
                  <InfoRow label="Constraints" value={data.constraints.toLocaleString()} mono />
                  <Divider spacing="sm" />
                  <MonoLabel variant="faint" size="micro" className="mb-2 block">
                    Raw Proof Calldata (π)
                  </MonoLabel>
                  <pre className="max-h-40 overflow-auto rounded-lg border border-border-subtle bg-bg-base/80 p-3 font-mono text-[10px] leading-relaxed text-text-muted">
                    {JSON.stringify(data.rawProof, null, 2)}
                  </pre>
                  <button
                    type="button"
                    onClick={() => {
                      closeCommitmentDrawer()
                      openProofInspector()
                    }}
                    className="mt-3 flex items-center gap-1 font-mono text-[11px] text-orange-warm hover:text-orange-primary"
                  >
                    Open Proof Inspector
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </section>

              <section>
                <MonoLabel variant="muted" size="micro" className="mb-3 block">
                  Settlement
                </MonoLabel>
                <div className="rounded-xl border border-border-subtle glass-surface-light p-4 space-y-0">
                  <InfoRow label="Tx Hash" value={`${data.settlementTx.slice(0, 10)}…`} mono />
                  <InfoRow label="Block" value={data.settlementBlock.toLocaleString()} mono />
                  <InfoRow label="Gas Used" value={data.gasUsed} mono />
                </div>
              </section>
            </div>

            <div className="flex gap-3 border-t border-border-subtle p-5">
              <GhostButton className="flex-1 gap-2 border border-border-subtle">
                <ShieldCheck className="h-4 w-4" />
                Re-Verify Proof
              </GhostButton>
              <BeamButton className="flex-1 gap-2">
                <ExternalLink className="h-4 w-4" />
                View on Explorer
              </BeamButton>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function CommitmentDrawerHeader({
  hash,
  onClose,
}: {
  hash: string
  onClose: () => void
}) {
  return (
    <div className="flex items-start justify-between border-b border-border-subtle px-6 py-5">
      <div>
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-text-primary">
          Commitment Detail
        </h2>
        <button
          type="button"
          className="mt-2 flex items-center gap-2 font-mono text-xs text-orange-warm hover:text-orange-primary"
        >
          {hash.slice(0, 24)}…
          <Copy className="h-3 w-3 opacity-60" />
        </button>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function ParamCell({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">{label}</p>
      <p className={cn('mt-1 text-sm', accent ? 'text-orange-warm' : 'text-text-primary')}>
        {value}
      </p>
    </div>
  )
}
