import { GlassCard } from '@/components/ui/GlassCard'

interface ProofBucket {
  range: string
  percent: number
}

interface ProofTimeDistributionProps {
  buckets: readonly ProofBucket[]
  periodLabel: string
  p99Ms: string
}

export function ProofTimeDistribution({ buckets, periodLabel, p99Ms }: ProofTimeDistributionProps) {
  const maxPercent = Math.max(...buckets.map((b) => b.percent), 1)

  return (
    <GlassCard padding="md" className="h-full">
      <div className="mb-5">
        <h3 className="font-heading text-card-title text-text-primary">Proof Generation</h3>
        <p className="mt-0.5 font-mono text-[10px] text-text-faint">
          Timing Distribution (ms) · {periodLabel}
        </p>
      </div>

      <div className="space-y-3">
        {buckets.map((bucket) => (
          <div key={bucket.range} className="flex items-center gap-3">
            <span className="w-14 shrink-0 font-mono text-[10px] text-text-faint">
              {bucket.range}
            </span>
            <div className="relative h-5 flex-1 overflow-hidden rounded bg-bg-elevated/60">
              <div
                className="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-orange-deep to-orange-warm"
                style={{ width: `${(bucket.percent / maxPercent) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-mono text-[10px] text-text-muted">
              {bucket.percent}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border-subtle pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
          P99 Latency
        </p>
        <p className="mt-1 font-heading text-lg font-semibold text-orange-warm">{p99Ms}</p>
      </div>
    </GlassCard>
  )
}
