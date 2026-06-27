import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import type { VolumeChartPoint } from '@/features/stats/utils/statsTimeRange'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils/cn'

interface SettlementVolumeChartProps {
  data: VolumeChartPoint[]
  periodLabel: string
}

function VolumeChartSvg({
  data,
  className,
  height = 200,
}: {
  data: VolumeChartPoint[]
  className?: string
  height?: number
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const max = Math.max(...data.map((d) => d.value), total > 0 ? total * 0.15 : 1)
  const width = 560
  const padX = 40
  const padY = 24
  const chartW = width - padX * 2
  const chartH = height - padY * 2

  const points = data.map((d, i) => {
    const x = padX + (data.length <= 1 ? chartW / 2 : (i / (data.length - 1)) * chartW)
    const y = padY + chartH - (d.value / max) * chartH
    return { x, y, ...d }
  })

  const linePath =
    points.length > 1
      ? points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
      : points.length === 1
        ? `M${padX},${points[0].y} L${padX + chartW},${points[0].y}`
        : ''
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`
      : ''

  return (
    <div className={cn('relative', className)}>
      {total === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-[11px] text-text-faint">No settlement volume in this period</p>
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="volumeArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(196, 57, 15, 0.35)" />
            <stop offset="100%" stopColor="rgba(196, 57, 15, 0)" />
          </linearGradient>
          <linearGradient id="volumeLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#AA2608" />
            <stop offset="50%" stopColor="#C4390F" />
            <stop offset="100%" stopColor="#B76653" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((pct) => (
          <line
            key={pct}
            x1={padX}
            y1={padY + chartH * (1 - pct)}
            x2={padX + chartW}
            y2={padY + chartH * (1 - pct)}
            stroke="rgba(245,240,238,0.04)"
          />
        ))}

        {total > 0 && areaPath ? <path d={areaPath} fill="url(#volumeArea)" /> : null}
        {total > 0 && linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="url(#volumeLine)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {total > 0 &&
          points.map((p) => (
            <circle
              key={p.label}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#C4390F"
              stroke="#080608"
              strokeWidth="1.5"
            />
          ))}

        {points.map((p) => (
          <text
            key={`label-${p.label}`}
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            className="fill-text-faint"
            fontSize="10"
            fontFamily="DM Mono, monospace"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

export function SettlementVolumeChart({ data, periodLabel }: SettlementVolumeChartProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <GlassCard padding="md" className="h-full">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-heading text-card-title text-text-primary">Settlement Volume</h3>
            <p className="mt-0.5 font-mono text-[10px] text-text-faint">
              {periodLabel} · ETH Equivalent
            </p>
          </div>
          <button
            type="button"
            aria-label="Expand chart"
            onClick={() => setExpanded(true)}
            className="rounded-md p-1 text-text-faint transition-colors hover:bg-white/[0.04] hover:text-text-muted"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <VolumeChartSvg data={data} />
      </GlassCard>

      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/90 p-4 backdrop-blur-sm">
          <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-2xl">
            <div className="flex items-start justify-between border-b border-border-subtle px-6 py-4">
              <div>
                <h3 className="font-heading text-lg text-text-primary">Settlement Volume</h3>
                <p className="mt-0.5 font-mono text-[11px] text-text-faint">
                  {periodLabel} · ETH Equivalent
                </p>
              </div>
              <button
                type="button"
                aria-label="Close expanded chart"
                onClick={() => setExpanded(false)}
                className="rounded-md p-1.5 text-text-faint transition-colors hover:bg-white/[0.04] hover:text-text-muted"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 p-6">
              <VolumeChartSvg data={data} height={360} className="h-full" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
