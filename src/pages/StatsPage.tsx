import { useState } from 'react'
import type { StatsTimeRange } from '@/features/stats/data/mockStats'
import {
  useProofLatencyLabel,
  useStatsPageData,
} from '@/features/stats/hooks/useStatsPageData'
import { StatsHeader } from '@/features/stats/components/StatsHeader'
import { KPIStatCard } from '@/features/stats/components/KPIStatCard'
import { SettlementVolumeChart } from '@/features/stats/components/SettlementVolumeChart'
import { ProofTimeDistribution } from '@/features/stats/components/ProofTimeDistribution'
import { CircuitHealthCard } from '@/features/stats/components/CircuitHealthCard'
import { RecentSettlementsCard, ContractRegistryCard } from '@/features/stats/components/RecentSettlementsCard'

export function StatsPage() {
  const [timeRange, setTimeRange] = useState<StatsTimeRange>('7d')
  const { kpis, volumeChart, proofBuckets, recentRows, periodLabel, isLive } =
    useStatsPageData(timeRange)
  const p99Ms = useProofLatencyLabel(timeRange)

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <StatsHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <KPIStatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            trendLabel={kpi.trendLabel}
            trendUp={kpi.trendUp}
            progress={'progress' in kpi ? kpi.progress : undefined}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SettlementVolumeChart data={volumeChart} periodLabel={periodLabel} />
        </div>
        <ProofTimeDistribution
          buckets={proofBuckets}
          periodLabel={periodLabel}
          p99Ms={p99Ms}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CircuitHealthCard />
        <RecentSettlementsCard liveRows={isLive ? recentRows : null} />
      </div>

      <ContractRegistryCard />
    </div>
  )
}
