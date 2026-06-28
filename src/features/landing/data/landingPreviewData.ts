/** Frozen demo data for the landing terminal — fully self-contained (no trade/app imports). */
export const LANDING_PREVIEW_MARKET = {
  base: 'ETH',
  quote: 'USDC',
  label: 'ETH / USDC',
  lastPrice: 3421.5,
  change24h: -1.2,
  volume24h: 847.3,
} as const

export const LANDING_PREVIEW_BUY_DEPTH = [
  { price: 3420, size: 12.4 },
  { price: 3419, size: 28.1 },
  { price: 3418, size: 45.6 },
  { price: 3417, size: 18.2 },
  { price: 3416, size: 62.0 },
  { price: 3415, size: 31.5 },
]

export const LANDING_PREVIEW_SELL_DEPTH = [
  { price: 3422, size: 10.8 },
  { price: 3423, size: 22.4 },
  { price: 3424, size: 38.9 },
  { price: 3425, size: 15.3 },
  { price: 3426, size: 54.2 },
  { price: 3427, size: 27.7 },
]

export const LANDING_PREVIEW_SETTLEMENT_ROWS = [
  {
    id: 's1',
    time: '14:32:08',
    pair: 'ETH/USDC',
    price: '3,421.50',
    amount: '2.50',
    status: 'SETTLED' as const,
    txHash: '0xA1f9…9fB2',
  },
  {
    id: 's2',
    time: '14:31:44',
    pair: 'ETH/USDC',
    price: '3,419.20',
    amount: '1.20',
    status: 'PROVING' as const,
    txHash: '0x7c3e…4a1D',
  },
  {
    id: 's3',
    time: '14:30:12',
    pair: 'ETH/USDC',
    price: '3,418.00',
    amount: '0.85',
    status: 'ON-CHAIN' as const,
    txHash: '0x2b8a…c77F',
  },
]
