export type StatsTimeRange = '1h' | '24h' | '7d' | '30d' | 'all'

export const MOCK_KPIS = [
  {
    label: 'Total Volume',
    value: '2,405.18 ETH',
    trend: '+12.4%',
    trendLabel: 'vs last 7D',
    trendUp: true,
  },
  {
    label: 'Total Orders',
    value: '14,892',
    trend: '+5.2%',
    trendLabel: 'vs last 7D',
    trendUp: true,
  },
  {
    label: 'Proofs Generated',
    value: '8,204',
    trend: null,
    trendLabel: null,
    trendUp: null,
  },
  {
    label: 'Avg Proof Time',
    value: '1.24s',
    trend: '0.1s',
    trendLabel: 'improvement',
    trendUp: true,
  },
  {
    label: 'Settlement Rate',
    value: '99.8%',
    progress: 99.8,
    trend: null,
    trendLabel: null,
    trendUp: null,
  },
] as const

export const VOLUME_CHART_DATA = [
  { day: 'Mon', value: 280 },
  { day: 'Tue', value: 340 },
  { day: 'Wed', value: 310 },
  { day: 'Thu', value: 420 },
  { day: 'Fri', value: 380 },
  { day: 'Sat', value: 290 },
  { day: 'Sun', value: 385 },
] as const

export const PROOF_TIME_BUCKETS = [
  { range: '0–500', percent: 15 },
  { range: '500–1k', percent: 45 },
  { range: '1k–1.5k', percent: 25 },
  { range: '1.5k+', percent: 15 },
] as const

export const CIRCUIT_HEALTH = {
  activeCircuits: '4/4',
  healthStatus: 'Healthy',
  constraints: '2^18',
  verifierContract: '0x8f…3a9c',
  lastUpdate: '2 mins ago',
  provingKeyHash: '0x2a…f71e',
  verificationGas: '~142k',
} as const

export const RECENT_SETTLEMENTS = [
  { txHash: '0xA1f9…9fB2', size: '2.50', proofTime: '1.1s', status: 'settled' as const },
  { txHash: '0x7c3e…4a1D', size: '1.20', proofTime: '0.9s', status: 'settled' as const },
  { txHash: '0x2b8a…c77F', size: '0.85', proofTime: '—', status: 'pending' as const },
  { txHash: '0x9d1f…e32A', size: '4.10', proofTime: '1.4s', status: 'settled' as const },
  { txHash: '0x5e4c…b91E', size: '0.50', proofTime: '—', status: 'pending' as const },
] as const

export const CONTRACT_REGISTRY = [
  { name: 'ShadowPool Core', address: '0x4a3f…2d1c', network: 'Sepolia', status: 'active' as const },
  { name: 'Groth16 Verifier', address: '0x8f2a…3a9c', network: 'Sepolia', status: 'active' as const },
  { name: 'Commitment Registry', address: '0x1b7e…8f42', network: 'Sepolia', status: 'active' as const },
  { name: 'Settlement Router', address: '0x9c4d…1e7a', network: 'Sepolia', status: 'active' as const },
] as const
