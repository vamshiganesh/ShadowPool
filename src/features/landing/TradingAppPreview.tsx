import { ArrowLeftRight, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { StatusPill } from '@/components/ui/StatusPill'
import { InlineCodePill } from '@/components/ui/InlineCodePill'
import { useSettlementFeed } from '@/lib/protocol/hooks/useProtocolData'
import { useMarketData } from '@/lib/protocol/hooks/useMarketData'

interface TradingAppPreviewProps {
  className?: string
}

export function TradingAppPreview({ className }: TradingAppPreviewProps) {
  const { rows } = useSettlementFeed()
  const { market, buyDepth, sellDepth } = useMarketData()
  const previewRows = rows.slice(0, 3)
  const isNegative = market.change24h < 0

  return (
    <div className={cn('relative mx-auto w-full max-w-4xl', className)}>
      <div
        className="pointer-events-none absolute -inset-8 rounded-3xl opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(196, 57, 15, 0.15) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="glass-surface-strong overflow-hidden rounded-2xl border border-border-default shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
              ShadowPool Terminal
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-text-muted">{market.label}</span>
            <span className="text-text-primary transition-all duration-500">
              {market.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className={cn('flex items-center gap-1', isNegative ? 'text-red-400' : 'text-emerald-400')}>
              {isNegative ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {market.change24h}%
            </span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_220px]">
          <div className="border-r border-border-subtle p-4">
            <PreviewDepthChart midPrice={market.lastPrice} buyDepth={buyDepth} sellDepth={sellDepth} />
            <div className="mt-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
                Live Settlement Feed
              </p>
              <div className="space-y-1.5">
                {previewRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between rounded-lg bg-bg-elevated/50 px-3 py-2 font-mono text-[10px]"
                  >
                    <span className="text-text-faint">{row.time}</span>
                    <span className="text-text-muted">{row.pair}</span>
                    <span className="text-text-secondary">{row.price}</span>
                    <StatusPill
                      label={row.status}
                      variant={row.status === 'SETTLED' ? 'success' : 'pending'}
                      dot
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-3 flex rounded-lg border border-border-subtle p-0.5">
              <button
                type="button"
                className="flex-1 rounded-md bg-emerald-500/15 py-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400"
              >
                Buy
              </button>
              <button
                type="button"
                className="flex-1 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-faint"
              >
                Sell
              </button>
            </div>

            <div className="space-y-3">
              <PreviewField
                label="Price"
                value={market.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              />
              <PreviewField label="Amount" value="2.50 ETH" />
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  ZK Commitment
                </p>
                <InlineCodePill className="w-full max-w-none justify-center">
                  0x8f2a…c93b
                </InlineCodePill>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-gradient-to-b from-orange-primary to-orange-deep py-2.5 font-mono text-[11px] font-medium uppercase tracking-wider text-text-primary shadow-glow"
            >
              Commit Order
            </button>

            <div className="mt-5 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                Lifecycle
              </p>
              {['Created', 'On-Chain', 'Matched', 'Proof', 'Settled'].map((stage, i) => (
                <div key={stage} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      i <= 2 ? 'bg-orange-primary' : 'bg-border-strong',
                    )}
                  />
                  <span
                    className={cn(
                      'font-mono text-[10px]',
                      i === 2 ? 'text-orange-warm' : 'text-text-faint',
                    )}
                  >
                    {stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-4 -top-4 hidden rounded-xl glass-surface px-3 py-2 lg:block">
        <div className="flex items-center gap-2 font-mono text-[10px] text-text-muted">
          <ArrowLeftRight className="h-3 w-3 text-orange-warm" />
          <span>Matched</span>
          <TrendingUp className="h-3 w-3 text-emerald-400" />
        </div>
      </div>
    </div>
  )
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-text-faint">
        {label}
      </p>
      <div className="rounded-lg border border-border-subtle bg-bg-elevated/60 px-3 py-2 font-mono text-xs text-text-primary">
        {value}
      </div>
    </div>
  )
}

function PreviewDepthChart({
  midPrice,
  buyDepth,
  sellDepth,
}: {
  midPrice: number
  buyDepth: { price: number; size: number }[]
  sellDepth: { price: number; size: number }[]
}) {
  const maxSize = Math.max(
    ...buyDepth.map((d) => d.size),
    ...sellDepth.map((d) => d.size),
    1,
  )

  const buyPoints = buyDepth.map((d, i) => {
    const x = 200 - (i + 1) * (180 / buyDepth.length)
    const y = 120 - (d.size / maxSize) * 100
    return `${x},${y}`
  })
  const sellPoints = sellDepth.map((d, i) => {
    const x = 200 + (i + 1) * (180 / sellDepth.length)
    const y = 120 - (d.size / maxSize) * 100
    return `${x},${y}`
  })

  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated/40">
      <svg viewBox="0 0 400 120" className="h-full w-full transition-all duration-700" preserveAspectRatio="none">
        <defs>
          <linearGradient id="buyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(74, 222, 128, 0.25)" />
            <stop offset="100%" stopColor="rgba(74, 222, 128, 0)" />
          </linearGradient>
          <linearGradient id="sellGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(248, 113, 113, 0.2)" />
            <stop offset="100%" stopColor="rgba(248, 113, 113, 0)" />
          </linearGradient>
        </defs>
        <path
          d={`M200,120 L${buyPoints.join(' L')} L0,120 Z`}
          fill="url(#buyGrad)"
          className="transition-all duration-700"
        />
        <path
          d={`M200,120 L${sellPoints.join(' L')} L400,120 Z`}
          fill="url(#sellGrad)"
          className="transition-all duration-700"
        />
        <line x1="200" y1="0" x2="200" y2="120" stroke="rgba(245,240,238,0.08)" />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-pill border border-border-subtle bg-bg-base/90 px-3 py-1 font-mono text-xs text-text-primary transition-all duration-500">
        {midPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
    </div>
  )
}
