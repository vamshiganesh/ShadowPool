import { useTradeStore } from '@/store/tradeStore'
import { DEPTH_RESOLUTIONS, MARKET_PAIR, BUY_DEPTH, SELL_DEPTH } from '@/features/trade/data/mockMarket'
import { GlassCard } from '@/components/ui/GlassCard'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { cn } from '@/lib/utils/cn'

export function DepthChartCard() {
  const { depthResolution, setDepthResolution } = useTradeStore()

  const maxBuy = Math.max(...BUY_DEPTH.map((d) => d.size))
  const maxSell = Math.max(...SELL_DEPTH.map((d) => d.size))
  const maxSize = Math.max(maxBuy, maxSell)

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
        <MonoLabel variant="muted" size="micro">
          Depth Chart
        </MonoLabel>
        <div className="flex gap-1">
          {DEPTH_RESOLUTIONS.map((res) => (
            <button
              key={res}
              type="button"
              onClick={() => setDepthResolution(res)}
              className={cn(
                'rounded px-2 py-0.5 font-mono text-[10px] transition-colors',
                depthResolution === res
                  ? 'bg-orange-primary/15 text-orange-warm'
                  : 'text-text-faint hover:text-text-muted',
              )}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-56 p-4 md:h-64">
        <svg viewBox="0 0 600 200" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="depthBuy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(74, 222, 128, 0.3)" />
              <stop offset="100%" stopColor="rgba(74, 222, 128, 0)" />
            </linearGradient>
            <linearGradient id="depthSell" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(248, 113, 113, 0.25)" />
              <stop offset="100%" stopColor="rgba(248, 113, 113, 0)" />
            </linearGradient>
          </defs>

          <BuyArea data={BUY_DEPTH} maxSize={maxSize} />
          <SellArea data={SELL_DEPTH} maxSize={maxSize} />

          <line
            x1="300"
            y1="0"
            x2="300"
            y2="200"
            stroke="rgba(245,240,238,0.1)"
            strokeDasharray="4 4"
          />
        </svg>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-pill border border-border-subtle bg-bg-base/95 px-4 py-1.5 font-mono text-sm text-text-primary shadow-md">
          {MARKET_PAIR.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </GlassCard>
  )
}

function BuyArea({
  data,
  maxSize,
}: {
  data: { price: number; size: number }[]
  maxSize: number
}) {
  const points = data.map((d, i) => {
    const x = 300 - (i + 1) * (280 / data.length)
    const y = 200 - (d.size / maxSize) * 180
    return `${x},${y}`
  })
  const path = `M300,200 L${points.join(' L')} L0,200 Z`

  return <path d={path} fill="url(#depthBuy)" />
}

function SellArea({
  data,
  maxSize,
}: {
  data: { price: number; size: number }[]
  maxSize: number
}) {
  const points = data.map((d, i) => {
    const x = 300 + (i + 1) * (280 / data.length)
    const y = 200 - (d.size / maxSize) * 180
    return `${x},${y}`
  })
  const path = `M300,200 L${points.join(' L')} L600,200 Z`

  return <path d={path} fill="url(#depthSell)" />
}
