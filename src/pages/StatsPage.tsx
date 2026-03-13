import { useState } from 'react'
import type { StatsTimeRange } from '@/features/stats/data/mockStats'
import { MOCK_KPIS } from '@/features/stats/data/mockStats'
import { StatsHeader } from '@/features/stats/components/StatsHeader'
import { KPIStatCard } from '@/features/stats/components/KPIStatCard'
import { SettlementVolumeChart } from '@/features/stats/components/SettlementVolumeChart'
import { ProofTimeDistribution } from '@/features/stats/components/ProofTimeDistribution'
import { CircuitHealthCard } from '@/features/stats/components/CircuitHealthCard'
import { RecentSettlementsCard } from '@/features/stats/components/RecentSettlementsCard'
import { ContractRegistryCard } from '@/features/stats/components/ContractRegistryCard'

export function StatsPage() {
  const [timeRange, setTimeRange] = useState<StatsTimeRange>('7d')

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <StatsHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {MOCK_KPIS.map((kpi) => (
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
          <SettlementVolumeChart />
        </div>
        <ProofTimeDistribution />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CircuitHealthCard />
        <RecentSettlementsCard />
      </div>

      <ContractRegistryCard />
    </div>
  )
}
