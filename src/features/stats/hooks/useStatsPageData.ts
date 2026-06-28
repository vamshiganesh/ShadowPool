import { useMemo } from 'react'
import { MOCK_KPIS, PROOF_TIME_BUCKETS, RECENT_SETTLEMENTS, type StatsTimeRange } from '@/features/stats/data/mockStats'
import {
  bucketVolumeEvents,
  countSettlementEvents,
  getMockVolumeChart,
  getRangeLabel,
  isWithinRange,
  type VolumeEvent,
} from '@/features/stats/utils/statsTimeRange'
import { PROTOCOL } from '@/lib/constants/protocol'
import { formatEthAmount, truncateHash } from '@/lib/protocol/format'
import { loadLocalCommitments } from '@/lib/protocol/localCommitments'
import { useIsChainLive } from '@/lib/protocol/hooks/useProtocolData'
import { useProtocolEventStore } from '@/store/protocolEventStore'
import type { ChainCommitment, LocalCommitmentMeta } from '@/lib/protocol/types'

export interface StatsKpiRow {
  label: string
  value: string
  trend: string | null
  trendLabel: string | null
  trendUp: boolean | null
  progress?: number
}

/** Escrow is released after settlement — fall back to the amount stored locally at commit time. */
function volumeEthFromCommitment(
  c: ChainCommitment,
  local: LocalCommitmentMeta[],
): number {
  if (c.escrowWei > 0n) return Number(c.escrowWei) / 1e18
  const meta = local.find((l) => l.hash.toLowerCase() === c.hash.toLowerCase())
  if (!meta?.amount) return 0
  const parsed = parseFloat(meta.amount.replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function volumeEthFromSettlement(
  s: { escrowA?: bigint; escrowB?: bigint },
  local: LocalCommitmentMeta[],
  commitmentA: string,
  commitmentB: string,
): number {
  const onChain = Number((s.escrowA ?? 0n) + (s.escrowB ?? 0n)) / 1e18
  if (onChain > 0) return onChain
  const a = local.find((l) => l.hash.toLowerCase() === commitmentA.toLowerCase())
  const b = local.find((l) => l.hash.toLowerCase() === commitmentB.toLowerCase())
  const parse = (amount?: string) => {
    if (!amount) return 0
    const n = parseFloat(amount.replace(/,/g, '').trim())
    return Number.isFinite(n) ? n : 0
  }
  return parse(a?.amount) + parse(b?.amount)
}

export function useStatsPageData(timeRange: StatsTimeRange) {
  const isLive = useIsChainLive()
  const commitments = useProtocolEventStore((s) => s.commitments)
  const settlements = useProtocolEventStore((s) => s.settlements)

  const periodLabel = getRangeLabel(timeRange)

  return useMemo(() => {
    if (!isLive) {
      const volumeChart = getMockVolumeChart(timeRange)
      const scale = timeRange === '1h' ? 0.08 : timeRange === '24h' ? 0.35 : timeRange === '30d' ? 1.4 : timeRange === 'all' ? 2.2 : 1
      const kpis: StatsKpiRow[] = MOCK_KPIS.map((k) => ({
        ...k,
        trendLabel: k.trendLabel?.replace('7D', timeRange.toUpperCase()) ?? k.trendLabel,
        value:
          k.label === 'Total Volume'
            ? `${(2405.18 * scale).toFixed(2)} ETH`
            : k.label === 'Total Orders'
              ? Math.round(14892 * scale).toLocaleString()
              : k.label === 'Proofs Generated'
                ? Math.round(8204 * scale).toLocaleString()
                : k.value,
      }))
      return {
        isLive: false,
        periodLabel,
        kpis,
        volumeChart,
        proofBuckets: PROOF_TIME_BUCKETS.map((b) => ({
          ...b,
          percent: Math.min(100, Math.round(b.percent * (timeRange === '1h' ? 0.6 : 1))),
        })),
        recentRows: RECENT_SETTLEMENTS.slice(0, timeRange === '1h' ? 2 : timeRange === 'all' ? 5 : 4).map(
          (r) => ({ ...r }),
        ),
      }
    }

    const filteredCommitments = [...commitments.values()].filter((c) =>
      isWithinRange(c.blockTimestamp, timeRange),
    )
    const filteredSettlements = settlements.filter((s) => isWithinRange(s.blockTimestamp, timeRange))
    const local = loadLocalCommitments()

    let totalVolumeEth = filteredSettlements.reduce(
      (sum, s) =>
        sum +
        volumeEthFromSettlement(s, local, s.commitmentA, s.commitmentB),
      0,
    )
    if (totalVolumeEth === 0) {
      totalVolumeEth = filteredCommitments
        .filter((c) => c.status === 'settled')
        .reduce((sum, c) => sum + volumeEthFromCommitment(c, local), 0)
    }

    const settledCount = filteredCommitments.filter((c) => c.status === 'settled').length
    const openCount = filteredCommitments.filter((c) => c.status === 'onchain').length
    const totalCount = filteredCommitments.length
    const settlementRate = totalCount > 0 ? (settledCount / totalCount) * 100 : 0
    const settlementEventCount = countSettlementEvents(filteredSettlements.length, settledCount)

    const kpis: StatsKpiRow[] = [
      {
        label: 'Total Volume',
        value: `${totalVolumeEth.toFixed(4)} ETH`,
        trend: null,
        trendLabel: periodLabel.toLowerCase(),
        trendUp: true,
      },
      {
        label: 'Total Commitments',
        value: totalCount.toLocaleString(),
        trend: null,
        trendLabel: periodLabel.toLowerCase(),
        trendUp: true,
      },
      {
        label: 'Settlements',
        value: settlementEventCount.toLocaleString(),
        trend: null,
        trendLabel: 'verified',
        trendUp: null,
      },
      {
        label: 'Open Commitments',
        value: openCount.toLocaleString(),
        trend: null,
        trendLabel: 'live',
        trendUp: null,
      },
      {
        label: 'Settlement Rate',
        value: `${settlementRate.toFixed(1)}%`,
        progress: settlementRate,
        trend: null,
        trendLabel: null,
        trendUp: null,
      },
    ]

    const settledHashes = new Set(
      filteredSettlements.flatMap((s) => [
        s.commitmentA.toLowerCase(),
        s.commitmentB.toLowerCase(),
      ]),
    )

    const volumeEvents: VolumeEvent[] = [
      ...filteredSettlements.map((s) => ({
        timestampSec: s.blockTimestamp,
        volumeEth: volumeEthFromSettlement(s, local, s.commitmentA, s.commitmentB),
      })),
      ...filteredCommitments
        .filter((c) => c.status === 'settled' && !settledHashes.has(c.hash.toLowerCase()))
        .map((c) => ({
          timestampSec: c.blockTimestamp,
          volumeEth: volumeEthFromCommitment(c, local),
        })),
    ]

    const volumeChart = bucketVolumeEvents(volumeEvents, timeRange)

    const recentRows = [
      ...filteredSettlements.map((s) => {
        const vol = volumeEthFromSettlement(s, local, s.commitmentA, s.commitmentB)
        const half = vol > 0 ? vol / 2 : 0
        return {
          txHash: truncateHash(s.txHash),
          size: formatEthAmount(half > 0 ? BigInt(Math.round(half * 1e18)) : 1n),
          proofTime: '—',
          status: 'settled' as const,
        }
      }),
      ...filteredCommitments
        .filter((c) => c.status === 'settled' && !settledHashes.has(c.hash.toLowerCase()))
        .slice(0, Math.max(0, 5 - filteredSettlements.length))
        .map((c) => {
          const vol = volumeEthFromCommitment(c, local)
          return {
            txHash: truncateHash(c.txHash),
            size: formatEthAmount(
              vol > 0 ? BigInt(Math.round(vol * 1e18)) : c.escrowWei > 0n ? c.escrowWei : 1n,
            ),
            proofTime: '—',
            status: 'settled' as const,
          }
        }),
    ].slice(0, 5)

    return {
      isLive: true,
      periodLabel,
      kpis,
      volumeChart,
      proofBuckets: PROOF_TIME_BUCKETS,
      recentRows,
    }
  }, [isLive, timeRange, periodLabel, commitments, settlements])
}

export function useProofLatencyLabel(timeRange: StatsTimeRange): string {
  const base = PROTOCOL.avgProofTimeMs
  const factor =
    timeRange === '1h' ? 0.85 : timeRange === '24h' ? 0.95 : timeRange === '30d' ? 1.05 : 1
  return `${Math.round(base * factor).toLocaleString()} ms`
}
