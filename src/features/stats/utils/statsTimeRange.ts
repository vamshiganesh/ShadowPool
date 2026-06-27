import type { StatsTimeRange } from '@/features/stats/data/mockStats'

export interface VolumeChartPoint {
  label: string
  value: number
}

export function getRangeLabel(range: StatsTimeRange): string {
  switch (range) {
    case '1h':
      return 'Last 1 Hour'
    case '24h':
      return 'Last 24 Hours'
    case '7d':
      return 'Last 7 Days'
    case '30d':
      return 'Last 30 Days'
    case 'all':
      return 'All Time'
  }
}

/** Unix seconds — null means no lower bound (all time). */
export function getRangeStartSec(range: StatsTimeRange, nowSec = Math.floor(Date.now() / 1000)): number | null {
  switch (range) {
    case '1h':
      return nowSec - 3600
    case '24h':
      return nowSec - 86_400
    case '7d':
      return nowSec - 7 * 86_400
    case '30d':
      return nowSec - 30 * 86_400
    case 'all':
      return null
  }
}

export function isWithinRange(timestampSec: number | undefined, range: StatsTimeRange): boolean {
  if (timestampSec === undefined) return range === 'all'
  const since = getRangeStartSec(range)
  if (since === null) return true
  return timestampSec >= since
}

const MOCK_VOLUME: Record<StatsTimeRange, VolumeChartPoint[]> = {
  '1h': [
    { label: '0m', value: 12 },
    { label: '10m', value: 28 },
    { label: '20m', value: 45 },
    { label: '30m', value: 38 },
    { label: '40m', value: 62 },
    { label: '50m', value: 55 },
    { label: '60m', value: 71 },
  ],
  '24h': [
    { label: '0h', value: 42 },
    { label: '4h', value: 58 },
    { label: '8h', value: 35 },
    { label: '12h', value: 72 },
    { label: '16h', value: 48 },
    { label: '20h', value: 91 },
    { label: '24h', value: 67 },
  ],
  '7d': [
    { label: 'Mon', value: 280 },
    { label: 'Tue', value: 340 },
    { label: 'Wed', value: 310 },
    { label: 'Thu', value: 420 },
    { label: 'Fri', value: 380 },
    { label: 'Sat', value: 290 },
    { label: 'Sun', value: 385 },
  ],
  '30d': [
    { label: 'W1', value: 820 },
    { label: 'W2', value: 940 },
    { label: 'W3', value: 760 },
    { label: 'W4', value: 1100 },
  ],
  all: [
    { label: 'Jan', value: 420 },
    { label: 'Feb', value: 580 },
    { label: 'Mar', value: 720 },
    { label: 'Apr', value: 890 },
    { label: 'May', value: 1050 },
    { label: 'Jun', value: 1240 },
  ],
}

export function getMockVolumeChart(range: StatsTimeRange): VolumeChartPoint[] {
  return MOCK_VOLUME[range]
}

export interface VolumeEvent {
  timestampSec?: number
  volumeEth: number
}

export function bucketVolumeEvents(
  events: VolumeEvent[],
  range: StatsTimeRange,
): VolumeChartPoint[] {
  const mock = getMockVolumeChart(range)
  const filtered = events.filter(
    (e) => e.volumeEth > 0 && isWithinRange(e.timestampSec, range),
  )

  if (filtered.length === 0) {
    return mock.map((p) => ({ ...p, value: 0 }))
  }

  const since = getRangeStartSec(range)
  const now = Math.floor(Date.now() / 1000)
  const start = since ?? filtered.reduce((min, e) => Math.min(min, e.timestampSec ?? now), now)
  const span = Math.max(now - start, 1)
  const bucketCount = mock.length

  const buckets = mock.map((m, i) => ({
    label: m.label,
    value: 0,
    from: start + (i / bucketCount) * span,
    to: start + ((i + 1) / bucketCount) * span,
  }))

  for (const event of filtered) {
    const ts = event.timestampSec ?? now
    const idx = Math.min(
      bucketCount - 1,
      Math.max(0, Math.floor(((ts - start) / span) * bucketCount)),
    )
    buckets[idx].value += event.volumeEth
  }

  return buckets.map(({ label, value }) => ({
    label,
    value: Math.round(value * 1_000_000) / 1_000_000,
  }))
}

export function bucketLiveVolume(
  settlements: { blockTimestamp?: number; escrowA?: bigint; escrowB?: bigint }[],
  range: StatsTimeRange,
): VolumeChartPoint[] {
  const events: VolumeEvent[] = settlements.map((s) => ({
    timestampSec: s.blockTimestamp,
    volumeEth: Number((s.escrowA ?? 0n) + (s.escrowB ?? 0n)) / 1e18,
  }))
  return bucketVolumeEvents(events, range)
}
