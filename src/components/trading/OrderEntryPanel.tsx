import type { ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { useTradeStore } from '@/store/tradeStore'
import { GlassCard } from '@/components/ui/GlassCard'
import { CommitmentHashBox } from '@/components/trading/CommitmentHashBox'
import { LifecycleStepper } from '@/components/trading/LifecycleStepper'
import { useCommitment } from '@/lib/crypto/useCommitment'
import { useSubmitCommitment } from '@/lib/contracts/useOrderBook'
import { useActiveCommitmentLifecycle } from '@/lib/hooks/useActiveCommitmentLifecycle'
import { cn } from '@/lib/utils/cn'
import type { MatcherUploadStatus } from '@/store/tradeStore'

export function OrderEntryPanel() {
  const {
    side,
    price,
    amount,
    activeLifecycleStage,
    matcherUploadStatus,
    matcherUploadError,
    setSide,
    setPrice,
    setAmount,
  } = useTradeStore()

  const { address } = useAccount()
  const { hash, isComputing, error, nonce, salt } = useCommitment(amount, price)
  useActiveCommitmentLifecycle(hash)
  const { submit, isPending, isConfirming } = useSubmitCommitment()

  const handleCommit = async () => {
    if (!hash || isComputing || isPending || isConfirming) return
    await submit({
      hash: hash as `0x${string}`,
      side,
      price,
      amount,
      nonce: nonce.toString(),
      salt: salt.toString(),
      trader: address,
    })
  }

  const isSubmitting = isPending || isConfirming
  const canSubmit = Boolean(hash) && !isComputing && !isSubmitting

  return (
    <div className="flex h-full flex-col gap-4">
      <GlassCard padding="md" className="flex-1">
        <div className="mb-4 flex rounded-lg border border-border-subtle p-0.5">
          <SideTab active={side === 'buy'} onClick={() => setSide('buy')} variant="buy">
            Buy
          </SideTab>
          <SideTab active={side === 'sell'} onClick={() => setSide('sell')} variant="sell">
            Sell
          </SideTab>
        </div>

        <div className="space-y-4">
          <OrderField
            label="Price (USDC)"
            value={price}
            onChange={setPrice}
          />
          <OrderField
            label="Amount (ETH)"
            value={amount}
            onChange={setAmount}
            action={
              <button
                type="button"
                className="font-mono text-[10px] uppercase tracking-wider text-orange-warm hover:text-orange-primary"
              >
                Max
              </button>
            }
          />
          <CommitmentHashBox hash={hash} isComputing={isComputing} />
          <p className="font-mono text-[9px] leading-relaxed text-text-faint">
            Poseidon hash (browser-side, circomlibjs) — binds amount, price, nonce &amp; salt.
          </p>
          {error && (
            <p className="font-mono text-[10px] text-red-400">{error}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleCommit}
          disabled={!canSubmit}
          className={cn(
            'mt-5 w-full rounded-lg bg-gradient-to-b from-orange-primary to-orange-deep py-3 font-mono text-xs font-medium uppercase tracking-wider text-text-primary shadow-glow transition-all hover:brightness-110 active:scale-[0.99]',
            !canSubmit && 'cursor-not-allowed opacity-50 hover:brightness-100',
          )}
        >
          {isSubmitting ? 'Submitting…' : 'Commit Order'}
        </button>

        <MatcherStatusBanner status={matcherUploadStatus} error={matcherUploadError} />
      </GlassCard>

      <GlassCard padding="md">
        <LifecycleStepper activeStage={activeLifecycleStage} />
      </GlassCard>
    </div>
  )
}

const MATCHER_LABELS: Record<MatcherUploadStatus, string | null> = {
  idle: null,
  signing: 'Sign to upload secrets to matcher…',
  uploading: 'Uploading secrets to matcher…',
  uploaded: 'Waiting for counterparty…',
  error: null,
}

function MatcherStatusBanner({
  status,
  error,
}: {
  status: MatcherUploadStatus
  error: string | null
}) {
  if (status === 'idle') return null

  if (status === 'error') {
    return (
      <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 font-mono text-[10px] text-red-400">
        Matcher upload failed — your order is still on-chain. Manual export still works.
        {error && (
          <span className="mt-1 block truncate opacity-70" title={error}>
            {error.slice(0, 80)}
          </span>
        )}
      </p>
    )
  }

  const label = MATCHER_LABELS[status]
  if (!label) return null

  return (
    <p
      className={cn(
        'mt-3 flex items-center gap-2 font-mono text-[10px] text-text-muted',
        status === 'uploaded' && 'text-orange-warm/80',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 shrink-0 rounded-full',
          status === 'uploaded' ? 'bg-orange-warm' : 'animate-pulse bg-text-faint',
        )}
      />
      {label}
    </p>
  )
}

function SideTab({
  active,
  onClick,
  variant,
  children,
}: {
  active: boolean
  onClick: () => void
  variant: 'buy' | 'sell'
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-md py-2 font-mono text-[11px] uppercase tracking-wider transition-colors',
        active && variant === 'buy' && 'bg-emerald-500/15 text-emerald-400',
        active && variant === 'sell' && 'bg-red-500/15 text-red-400',
        !active && 'text-text-faint hover:text-text-muted',
      )}
    >
      {children}
    </button>
  )
}

function OrderField({
  label,
  value,
  onChange,
  action,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  action?: ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
          {label}
        </label>
        {action}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border-subtle bg-bg-elevated/60 px-3 py-2.5 font-mono text-sm text-text-primary outline-none transition-colors focus:border-border-orange"
      />
    </div>
  )
}
