export const MARKET_PAIR = {
  base: 'ETH',
  quote: 'USDC',
  label: 'ETH / USDC',
  lastPrice: 3421.5,
  change24h: -1.2,
  volume24h: 847.3,
} as const

export const DEPTH_RESOLUTIONS = ['0.1', '1', '10'] as const

export type DepthResolution = (typeof DEPTH_RESOLUTIONS)[number]

export const BUY_DEPTH = [
  { price: 3420, size: 12.4 },
  { price: 3419, size: 28.1 },
  { price: 3418, size: 45.6 },
  { price: 3417, size: 18.2 },
  { price: 3416, size: 62.0 },
  { price: 3415, size: 31.5 },
]

export const SELL_DEPTH = [
  { price: 3422, size: 10.8 },
  { price: 3423, size: 22.4 },
  { price: 3424, size: 38.9 },
  { price: 3425, size: 15.3 },
  { price: 3426, size: 54.2 },
  { price: 3427, size: 27.7 },
]
