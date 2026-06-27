import type { SettlementStatus } from '@/features/trade/data/mockSettlements'
import type { OrderProofStatus } from '@/features/orders/data/mockOrders'
import type { LifecycleStageId } from '@/features/trade/data/mockLifecycle'

export type ChainCommitmentStatus = 'onchain' | 'settled' | 'cancelled'

export interface ChainCommitment {
  hash: `0x${string}`
  trader: `0x${string}`
  blockNumber: bigint
  txHash: `0x${string}`
  escrowWei: bigint
  status: ChainCommitmentStatus
  blockTimestamp?: number
}

export interface ChainSettlement {
  id: string
  commitmentA: `0x${string}`
  commitmentB: `0x${string}`
  clearingPrice: bigint
  traderA: `0x${string}`
  traderB: `0x${string}`
  blockNumber: bigint
  txHash: `0x${string}`
  blockTimestamp?: number
  escrowA?: bigint
  escrowB?: bigint
}

export interface SettlementFeedRow {
  id: string
  time: string
  pair: string
  price: string
  amount: string
  status: SettlementStatus
  txHash: string
  txHashFull: `0x${string}`
  commitmentHash?: `0x${string}`
}

export interface ProtocolStats {
  totalCommitments: number
  openCommitments: number
  totalSettlements: number
  totalVolumeEth: number
  settlementRate: number
  latestClearingPrice: number | null
  latestBlock: bigint | null
}

export interface LocalCommitmentMeta {
  hash: `0x${string}`
  side: 'buy' | 'sell'
  price: string
  amount: string
  /** Decimal string — required for off-chain prover witness */
  nonce?: string
  /** Decimal string — required for off-chain prover witness */
  salt?: string
  trader?: `0x${string}`
  submittedAt: number
  txHash?: `0x${string}`
}

export interface OrderRowFromChain {
  id: string
  type: 'buy' | 'sell'
  pair: string
  size: string
  price: string
  submitted: string
  proofStatus: OrderProofStatus
  proofElapsed?: string
  settlementTx: string | null
  commitmentHash: `0x${string}`
}

export function commitmentToLifecycleStage(
  commitment: ChainCommitment | undefined,
  settlement: ChainSettlement | undefined,
  options?: {
    hasComputedHash?: boolean
    hasCounterparty?: boolean
    isProving?: boolean
  },
): LifecycleStageId {
  if (settlement || commitment?.status === 'settled') return 'settled'
  if (options?.isProving) return 'proof'
  if (options?.hasCounterparty) return 'matched'
  if (commitment?.status === 'onchain') return 'onchain'
  if (commitment || options?.hasComputedHash) return 'created'
  return 'created'
}

export function findCounterpartyCommitment(
  commitment: ChainCommitment,
  openCommitments: ChainCommitment[],
): ChainCommitment | undefined {
  return openCommitments.find(
    (other) =>
      other.hash.toLowerCase() !== commitment.hash.toLowerCase() &&
      other.trader.toLowerCase() !== commitment.trader.toLowerCase() &&
      other.escrowWei === commitment.escrowWei &&
      other.status === 'onchain',
  )
}
