import { useTradeStore } from '@/store/tradeStore'
import { DEPTH_RESOLUTIONS } from '@/features/trade/data/mockMarket'
import { useMarketData } from '@/lib/protocol/hooks/useMarketData'
import { GlassCard } from '@/components/ui/GlassCard'
import { LiveDataBadge } from '@/components/ui/LiveDataBadge'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { PanelControls, ResizablePanel } from '@/components/ui/ResizablePanel'
import { cn } from '@/lib/utils/cn'

export function DepthChartCard() {
  const {
    depthResolution,
    setDepthResolution,
    depthPanelHeight,
    depthPanelWidth,
    depthPanelMaximized,
    setDepthPanelHeight,
    setDepthPanelWidth,
    setDepthPanelMaximized,
  } = useTradeStore()
  const { market, buyDepth, sellDepth } = useMarketData()

  const spreadFactor = depthResolution === '0.1' ? 0.4 : depthResolution === '10' ? 1.6 : 1

  const maxBuy = Math.max(...buyDepth.map((d) => d.size))
  const maxSell = Math.max(...sellDepth.map((d) => d.size))
  const maxSize = Math.max(maxBuy, maxSell)

  const cycleHeight = (direction: 'up' | 'down') => {
    const order = ['compact', 'default', 'tall'] as const
    const idx = order.indexOf(depthPanelHeight)
    const next =
      direction === 'up'
        ? order[Math.min(idx + 1, order.length - 1)]
        : order[Math.max(idx - 1, 0)]
    setDepthPanelHeight(next)
  }

  return (
    <ResizablePanel
      height={depthPanelHeight}
      width={depthPanelWidth}
      maximized={depthPanelMaximized}
      onHeightChange={setDepthPanelHeight}
      onWidthChange={setDepthPanelWidth}
      onMaximizedChange={setDepthPanelMaximized}
      defaultClassName="min-h-56 md:min-h-64"
      tallClassName="min-h-80 md:min-h-96"
      compactClassName="min-h-40"
    >
      <GlassCard padding="none" className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
          <MonoLabel variant="muted" size="micro">
            Depth Chart
          </MonoLabel>
          <div className="flex items-center gap-3">
            <LiveDataBadge />
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
            <PanelControls
              height={depthPanelHeight}
              width={depthPanelWidth}
              maximized={depthPanelMaximized}
              onHeightUp={() => cycleHeight('up')}
              onHeightDown={() => cycleHeight('down')}
              onToggleWidth={() =>
                setDepthPanelWidth(depthPanelWidth === 'wide' ? 'default' : 'wide')
              }
              onToggleMaximized={() => setDepthPanelMaximized(!depthPanelMaximized)}
            />
          </div>
        </div>

        <div className="relative min-h-0 flex-1 p-4">
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

            <BuyArea data={buyDepth} maxSize={maxSize} spreadFactor={spreadFactor} />
            <SellArea data={sellDepth} maxSize={maxSize} spreadFactor={spreadFactor} />

            <line
              x1="300"
              y1="0"
              x2="300"
              y2="200"
              stroke="rgba(245,240,238,0.1)"
              strokeDasharray="4 4"
            />
          </svg>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-pill border border-border-subtle bg-bg-base/95 px-4 py-1.5 font-mono text-sm text-text-primary shadow-md transition-all duration-500">
            {market.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </GlassCard>
    </ResizablePanel>
  )
}

function BuyArea({
  data,
  maxSize,
  spreadFactor,
}: {
  data: { price: number; size: number }[]
  maxSize: number
  spreadFactor: number
}) {
  const points = data.map((d, i) => {
    const x = 300 - (i + 1) * ((280 / data.length) * spreadFactor)
    const y = 200 - (d.size / maxSize) * 180
    return `${x},${y}`
  })
  const path = `M300,200 L${points.join(' L')} L0,200 Z`

  return <path d={path} fill="url(#depthBuy)" className="transition-all duration-700 ease-out" />
}

function SellArea({
  data,
  maxSize,
  spreadFactor,
}: {
  data: { price: number; size: number }[]
  maxSize: number
  spreadFactor: number
}) {
  const points = data.map((d, i) => {
    const x = 300 + (i + 1) * ((280 / data.length) * spreadFactor)
    const y = 200 - (d.size / maxSize) * 180
    return `${x},${y}`
  })
  const path = `M300,200 L${points.join(' L')} L600,200 Z`

  return <path d={path} fill="url(#depthSell)" className="transition-all duration-700 ease-out" />
}
