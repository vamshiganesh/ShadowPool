import { CIRCUIT_META } from '@/lib/crypto/circuitMeta'
import { etherscanTxUrl } from '@/lib/contracts/addresses'
import type { ActiveCommitment } from '@/store/tradeStore'
import type { ChainCommitment, ChainSettlement } from './types'

export interface CommitmentDetailView {
  hash: string
  status: 'on-chain' | 'settled' | 'cancelled'
  statusLabel: string
  proofSystem: string
  blockHeight: number | null
  pair: string
  direction: 'buy' | 'sell'
  size: string
  price: string
  notional: string
  provingSystem: string
  constraints: number
  rawProof: Record<string, unknown> | null
  hasProof: boolean
  settlementTx: string | null
  settlementBlock: number | null
  gasUsed: string | null
  etherscanUrl: string | null
  publicSignals: string[]
}

function parseNum(value: string): number {
  const n = parseFloat(value.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function formatUsd(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatEthSize(amount: number): string {
  if (amount === 0) return '0 ETH'
  if (amount < 0.000_000_1) return `${amount.toExponential(4)} ETH`
  if (amount < 0.0001) {
    const s = amount.toFixed(12).replace(/0+$/, '').replace(/\.$/, '')
    return `${s} ETH`
  }
  if (amount < 1) return `${amount.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')} ETH`
  return `${amount.toFixed(4)} ETH`
}

export function findSettlementForCommitment(
  hash: string,
  settlements: ChainSettlement[],
): ChainSettlement | undefined {
  const key = hash.toLowerCase()
  return settlements.find(
    (s) =>
      s.commitmentA.toLowerCase() === key || s.commitmentB.toLowerCase() === key,
  )
}

export function buildCommitmentDetail(
  meta: ActiveCommitment,
  chain?: ChainCommitment,
  settlement?: ChainSettlement,
): CommitmentDetailView {
  const amount = parseNum(meta.amount)
  const price = parseNum(meta.price)
  const notional = amount * price

  const status: CommitmentDetailView['status'] =
    chain?.status === 'settled' || settlement
      ? 'settled'
      : chain?.status === 'cancelled'
        ? 'cancelled'
        : 'on-chain'

  const statusLabel =
    status === 'settled' ? 'Settled' : status === 'cancelled' ? 'Cancelled' : 'On-Chain'

  const blockHeight = chain?.blockNumber
    ? Number(chain.blockNumber)
    : settlement?.blockNumber
      ? Number(settlement.blockNumber)
      : null

  const txHash = settlement?.txHash ?? meta.txHash ?? chain?.txHash
  const counterparty =
    settlement && meta.hash
      ? settlement.commitmentA.toLowerCase() === meta.hash.toLowerCase()
        ? settlement.commitmentB
        : settlement.commitmentA
      : null

  const clearingPrice = settlement
    ? (Number(settlement.clearingPrice) / 1e6).toFixed(2)
    : null

  const publicSignals = settlement
    ? [meta.hash, counterparty!, clearingPrice!]
    : [
        meta.hash,
        '— (counterparty commitment; appears after match)',
        '— (clearing price; set at settlement)',
      ]

  const rawProof =
    status === 'settled'
      ? {
          note: 'Full Groth16 proof is generated off-chain by the prover service at settlement.',
          circuit: CIRCUIT_META.name,
          publicSignals,
        }
      : {
          note:
            'Groth16 public signals are finalized when the off-chain matcher pairs this order with a counterparty and the prover submits settlement.',
          commitmentHash: meta.hash,
          expectedPublicSignalsAtSettlement: [
            'commitmentA (this order)',
            'commitmentB (counterparty)',
            'clearingPrice (USDC, 6 decimals)',
          ],
          currentPublicSignals: publicSignals,
        }

  return {
    hash: meta.hash,
    status,
    statusLabel,
    proofSystem: CIRCUIT_META.provingSystem,
    blockHeight,
    pair: 'ETH / USDC',
    direction: meta.side,
    size: formatEthSize(amount),
    price: `${formatUsd(price)} USDC`,
    notional: `${formatUsd(notional)} USDC`,
    provingSystem: `${CIRCUIT_META.provingSystem}_${CIRCUIT_META.curve}`,
    constraints: CIRCUIT_META.constraints,
    rawProof,
    hasProof: status === 'settled',
    settlementTx: txHash ?? null,
    settlementBlock: settlement ? Number(settlement.blockNumber) : blockHeight,
    gasUsed: null,
    etherscanUrl: txHash ? etherscanTxUrl(txHash) : null,
    publicSignals,
  }
}
