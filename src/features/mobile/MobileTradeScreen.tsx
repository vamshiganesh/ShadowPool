import { useEffect } from 'react'
import { useTradeStore } from '@/store/tradeStore'
import { MARKET_PAIR } from '@/features/trade/data/mockMarket'
import { MOCK_SETTLEMENTS } from '@/features/trade/data/mockSettlements'
import { CommitmentHashBox } from '@/components/trading/CommitmentHashBox'
import { LifecycleStepper } from '@/components/trading/LifecycleStepper'
import { StatusPill } from '@/components/ui/StatusPill'
import { useCommitment } from '@/lib/crypto/useCommitment'
import { useSubmitCommitment } from '@/lib/contracts/useOrderBook'
import { cn } from '@/lib/utils/cn'
import {
  ArrowLeftRight,
  BookOpen,
  LayoutGrid,
  Menu,
  Radio,
  TrendingDown,
} from 'lucide-react'

const MOBILE_NAV = [
  { id: 'trade', label: 'Trade', icon: ArrowLeftRight, active: true },
  { id: 'book', label: 'Book', icon: BookOpen, active: false },
  { id: 'proofs', label: 'Proofs', icon: Radio, active: false },
  { id: 'feed', label: 'Feed', icon: LayoutGrid, active: false },
  { id: 'portfolio', label: 'Portfolio', icon: LayoutGrid, active: false },
] as const

export function MobileTradeScreen() {
  const {
    side,
    price,
    amount,
    activeLifecycleStage,
    setSide,
    openCommitmentDrawer,
  } = useTradeStore()

  const { hash, isComputing } = useCommitment(amount, price)
  const { submit, isPending, isConfirming, isSuccess } = useSubmitCommitment()

  useEffect(() => {
    if (isSuccess) {
      openCommitmentDrawer()
    }
  }, [isSuccess, openCommitmentDrawer])

  const total = (parseFloat(price.replace(/,/g, '')) * parseFloat(amount)).toFixed(2)
  const isSubmitting = isPending || isConfirming
  const canSubmit = Boolean(hash) && !isComputing && !isSubmitting

  const handleCommit = async () => {
    if (!canSubmit || !hash) return
    await submit(hash, amount)
  }

  return (
    <div className="flex h-full flex-col bg-bg-base">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <span className="font-heading text-sm font-semibold text-text-primary">ShadowPool</span>
        <button
          type="button"
          className="rounded-pill border border-border-subtle px-3 py-1 font-mono text-[11px] text-text-secondary"
        >
          ETH / USDC
        </button>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-2 py-1 font-mono text-[10px] text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            0x71C…4f2
          </span>
          <button type="button" aria-label="Menu" className="text-text-muted">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-semibold tracking-tight text-text-primary">
              {MARKET_PAIR.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="flex items-center gap-0.5 rounded-pill bg-red-500/15 px-2 py-0.5 font-mono text-[10px] text-red-400">
              <TrendingDown className="h-3 w-3" />
              {MARKET_PAIR.change24h}%
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-text-faint">
            Vol {MARKET_PAIR.volume24h} ETH
          </p>
        </div>

        {/* Mini depth chart */}
        <MobileDepthChart />

        {/* Order form */}
        <div className="mt-4 rounded-xl border border-border-subtle glass-surface p-4">
          <div className="mb-3 flex rounded-lg border border-border-subtle p-0.5">
            {(['buy', 'sell'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={cn(
                  'flex-1 rounded-md py-2 font-mono text-[10px] uppercase tracking-wider',
                  side === s && s === 'buy' && 'bg-emerald-500/15 text-emerald-400',
                  side === s && s === 'sell' && 'bg-red-500/15 text-red-400',
                  side !== s && 'text-text-faint',
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <MobileField label="Price" value={price} />
            <MobileField label="Amount" value={`${amount} ETH`} />
            <MobileField label="Total" value={`${total} USDC`} />
            <CommitmentHashBox hash={hash} isComputing={isComputing} />
          </div>

          <button
            type="button"
            onClick={handleCommit}
            disabled={!canSubmit}
            className={cn(
              'mt-4 w-full rounded-lg bg-gradient-to-b from-orange-primary to-orange-deep py-3 font-mono text-[11px] uppercase tracking-wider text-text-primary',
              !canSubmit && 'cursor-not-allowed opacity-50',
            )}
          >
            {isSubmitting ? 'Submitting…' : 'Commit Order'}
          </button>
        </div>

        {/* Settlement feed */}
        <div className="mt-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
            Settlements
          </p>
          <div className="space-y-1.5">
            {MOCK_SETTLEMENTS.slice(0, 3).map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2"
              >
                <span className="font-mono text-[10px] text-text-faint">{row.time}</span>
                <span className="font-mono text-[10px] text-text-secondary">{row.price}</span>
                <StatusPill
                  label={row.status}
                  variant={row.status === 'SETTLED' ? 'success' : 'pending'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lifecycle strip */}
      <div className="border-t border-border-subtle px-4 py-3">
        <LifecycleStepper
          activeStage={activeLifecycleStage}
          orientation="horizontal"
          compact
        />
      </div>

      {/* Bottom nav */}
      <nav className="flex border-t border-border-subtle bg-bg-elevated/80 pb-safe">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5',
                item.active ? 'text-orange-warm' : 'text-text-faint',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="font-mono text-[9px] uppercase tracking-wider">{item.label}</span>
              {item.active && (
                <span className="h-1 w-1 rounded-full bg-orange-primary" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function MobileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/50 px-3 py-2.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">{label}</span>
      <span className="font-mono text-xs text-text-primary">{value}</span>
    </div>
  )
}

function MobileDepthChart() {
  return (
    <div className="relative h-24 overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated/40">
      <svg viewBox="0 0 300 80" className="h-full w-full" preserveAspectRatio="none">
        <rect x="0" y="0" width="150" height="80" fill="rgba(74,222,128,0.12)" />
        <rect x="150" y="0" width="150" height="80" fill="rgba(248,113,113,0.1)" />
        {[...Array(8)].map((_, i) => (
          <rect
            key={`b${i}`}
            x={10 + i * 16}
            y={80 - 20 - i * 5}
            width="10"
            height={20 + i * 5}
            fill="rgba(74,222,128,0.35)"
            rx="1"
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <rect
            key={`s${i}`}
            x={160 + i * 16}
            y={80 - 15 - i * 4}
            width="10"
            height={15 + i * 4}
            fill="rgba(248,113,113,0.3)"
            rx="1"
          />
        ))}
        <line x1="150" y1="0" x2="150" y2="80" stroke="rgba(245,240,238,0.1)" strokeDasharray="3 3" />
      </svg>
    </div>
  )
}
