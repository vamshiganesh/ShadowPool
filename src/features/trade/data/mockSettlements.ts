export type SettlementStatus = 'SETTLED' | 'PROVING' | 'ON-CHAIN' | 'MATCHED'

export interface SettlementRow {
  id: string
  time: string
  pair: string
  price: string
  amount: string
  status: SettlementStatus
  txHash: string
}

export const MOCK_SETTLEMENTS: SettlementRow[] = [
  {
    id: 's1',
    time: '14:32:08',
    pair: 'ETH/USDC',
    price: '3,421.50',
    amount: '2.50',
    status: 'SETTLED',
    txHash: '0xA1f9…9fB2',
  },
  {
    id: 's2',
    time: '14:31:44',
    pair: 'ETH/USDC',
    price: '3,419.20',
    amount: '1.20',
    status: 'PROVING',
    txHash: '0x7c3e…4a1D',
  },
  {
    id: 's3',
    time: '14:30:12',
    pair: 'ETH/USDC',
    price: '3,418.00',
    amount: '0.85',
    status: 'ON-CHAIN',
    txHash: '0x2b8a…c77F',
  },
  {
    id: 's4',
    time: '14:28:55',
    pair: 'ETH/USDC',
    price: '3,417.50',
    amount: '4.10',
    status: 'SETTLED',
    txHash: '0x9d1f…e32A',
  },
  {
    id: 's5',
    time: '14:27:30',
    pair: 'ETH/USDC',
    price: '3,416.80',
    amount: '0.50',
    status: 'MATCHED',
    txHash: '0x5e4c…b91E',
  },
]
