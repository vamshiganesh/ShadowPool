import { Maximize2 } from 'lucide-react'
import { VOLUME_CHART_DATA } from '@/features/stats/data/mockStats'
import { GlassCard } from '@/components/ui/GlassCard'

export function SettlementVolumeChart() {
  const data = VOLUME_CHART_DATA
  const max = Math.max(...data.map((d) => d.value))
  const width = 560
  const height = 200
  const padX = 40
  const padY = 24
  const chartW = width - padX * 2
  const chartH = height - padY * 2

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * chartW
    const y = padY + chartH - (d.value / max) * chartH
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`

  return (
    <GlassCard padding="md" className="h-full">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-heading text-card-title text-text-primary">Settlement Volume</h3>
          <p className="mt-0.5 font-mono text-[10px] text-text-faint">
            Trailing 7 Days · ETH Equivalent
          </p>
        </div>
        <button
          type="button"
          aria-label="Expand chart"
          className="text-text-faint hover:text-text-muted"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

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

        <path d={areaPath} fill="url(#volumeArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#volumeLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p) => (
          <circle
            key={p.day}
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
            key={`label-${p.day}`}
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            className="fill-text-faint"
            fontSize="10"
            fontFamily="DM Mono, monospace"
          >
            {p.day}
          </text>
        ))}
      </svg>
    </GlassCard>
  )
}
