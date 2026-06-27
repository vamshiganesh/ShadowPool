/** Shared protocol constants — single source for copy and mock data alignment */

export const PROTOCOL = {
  network: 'Sepolia',
  version: 'v1.0.4-stable',
  blockHeight: 7_234_891,
  constraints: 1_746,
  avgProofTime: '8.4s',
  avgProofTimeMs: 8400,
  settlementRate: '99.8%',
  circuit: 'shadowpool_match.circom',
  provingSystem: 'Groth16',
} as const

export const PROTOCOL_TICKER = [
  { label: '24h Volume', value: '$12.4M' },
  { label: 'Active Commitments', value: '1,847' },
  { label: 'Proofs Generated', value: '3,291' },
  { label: 'Settlement Rate', value: '99.7%' },
  { label: 'Avg Proof Time', value: PROTOCOL.avgProofTime },
  { label: 'Block', value: `#${PROTOCOL.blockHeight.toLocaleString()}` },
] as const

export const LANDING_TICKER = [
  { type: 'COMMITMENT', value: '0x7a3f…e91c', status: 'SETTLED' },
  { type: 'BLOCK', value: PROTOCOL.blockHeight.toLocaleString(), status: 'CONFIRMED' },
  { type: 'PROOF', value: 'verified_groth16', status: 'SUCCESS' },
  { type: 'COMMITMENT', value: '0x2b1a…d44f', status: 'PENDING' },
  { type: 'SETTLEMENT', value: '0x9c1e…a7b2', status: 'ATOMIC' },
  { type: 'MATCH', value: 'ETH/USDC', status: 'VALID' },
] as const
