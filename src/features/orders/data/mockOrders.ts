export type OrderFilterTab = 'all' | 'pending' | 'proving' | 'settled'

export type OrderProofStatus = 'pending' | 'proving' | 'settled' | 'failed'

export interface OrderRow {
  id: string
  type: 'buy' | 'sell'
  pair: string
  size: string
  price: string
  submitted: string
  proofStatus: OrderProofStatus
  proofElapsed?: string
  settlementTx: string | null
}

export const MOCK_ORDERS: OrderRow[] = [
  {
    id: 'ORD-8F2A91',
    type: 'buy',
    pair: 'ETH/USDC',
    size: '2.50',
    price: '3,421.50',
    submitted: '14:32:08',
    proofStatus: 'settled',
    settlementTx: '0x8f2a…9a1b',
  },
  {
    id: 'ORD-7C3E44',
    type: 'sell',
    pair: 'ETH/USDC',
    size: '1.20',
    price: '3,419.20',
    submitted: '14:28:15',
    proofStatus: 'settled',
    settlementTx: '0x7c3e…4a1d',
  },
  {
    id: 'ORD-2B8AC7',
    type: 'buy',
    pair: 'ETH/USDC',
    size: '0.85',
    price: '3,418.00',
    submitted: '14:25:42',
    proofStatus: 'proving',
    proofElapsed: '6.1s',
    settlementTx: null,
  },
  {
    id: 'ORD-9D1FE3',
    type: 'sell',
    pair: 'ETH/USDC',
    size: '4.10',
    price: '3,417.50',
    submitted: '14:20:33',
    proofStatus: 'settled',
    settlementTx: '0x9d1f…e32a',
  },
  {
    id: 'ORD-5E4CB9',
    type: 'buy',
    pair: 'ETH/USDC',
    size: '0.50',
    price: '3,416.80',
    submitted: '14:15:08',
    proofStatus: 'pending',
    settlementTx: null,
  },
  {
    id: 'ORD-1A7F62',
    type: 'sell',
    pair: 'ETH/USDC',
    size: '3.25',
    price: '3,422.10',
    submitted: '14:10:22',
    proofStatus: 'settled',
    settlementTx: '0x1a7f…62c4',
  },
  {
    id: 'ORD-6B3D18',
    type: 'buy',
    pair: 'ETH/USDC',
    size: '1.75',
    price: '3,420.00',
    submitted: '14:05:55',
    proofStatus: 'settled',
    settlementTx: '0x6b3d…18f9',
  },
  {
    id: 'ORD-4C9E27',
    type: 'buy',
    pair: 'ETH/USDC',
    size: '0.30',
    price: '3,415.60',
    submitted: '13:58:41',
    proofStatus: 'pending',
    settlementTx: null,
  },
]

export const ORDER_SUMMARY = {
  totalOrders: 24,
  totalVolume: '847.3 ETH',
  avgProofTime: '8.2s',
  settlementRate: '100%',
} as const

export const FILTER_COUNTS: Record<OrderFilterTab, number> = {
  all: 24,
  pending: 3,
  proving: 1,
  settled: 20,
}

export function filterOrders(orders: OrderRow[], tab: OrderFilterTab): OrderRow[] {
  if (tab === 'all') return orders
  if (tab === 'pending') return orders.filter((o) => o.proofStatus === 'pending')
  if (tab === 'proving') return orders.filter((o) => o.proofStatus === 'proving')
  return orders.filter((o) => o.proofStatus === 'settled')
}
