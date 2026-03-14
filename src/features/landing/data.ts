import { PROTOCOL } from '@/lib/constants/protocol'
import { ROUTES } from '@/lib/constants/routes'

export const HERO_CHIPS = [
  { label: 'Circom 2.0 Proofs', icon: 'circuit' as const },
  { label: 'Rust Matcher', icon: 'matcher' as const },
  { label: 'Solidity Settlement', icon: 'settlement' as const },
  { label: 'Groth16 On-Chain', icon: 'proof' as const },
] as const

export const STATS_STRIP = [
  { value: PROTOCOL.constraints.toLocaleString(), label: 'R1CS Constraints' },
  { value: PROTOCOL.avgProofTime, label: 'Avg Proof Time' },
  { value: '~142k', label: 'Gas per Settlement' },
  { value: PROTOCOL.provingSystem, label: 'Proving System' },
] as const

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Commit, Don\'t Broadcast',
    description:
      'Order inputs are hashed into a Poseidon commitment. Intent never enters the public mempool — only an opaque cryptographic fingerprint is revealed.',
    visual: 'code' as const,
  },
  {
    step: '02',
    title: 'Order Lands On-Chain',
    description:
      'The commitment hash is submitted to the ShadowPool contract. On-chain observers see a hash — not price, size, or direction.',
    visual: 'hash' as const,
  },
  {
    step: '03',
    title: 'Rust Matcher Pairs Orders',
    description:
      'An off-chain matching engine pairs compatible commitments privately. No order book leakage, no frontrunning surface.',
    visual: 'matcher' as const,
  },
  {
    step: '04',
    title: 'Groth16 Proof Generated',
    description:
      'A zero-knowledge proof demonstrates the match satisfies circuit constraints — valid inputs, correct pairing, no double-spend.',
    visual: 'proof' as const,
  },
  {
    step: '05',
    title: 'Atomic Settlement',
    description:
      'Proof and settlement transaction execute atomically on-chain. Funds move only if the proof verifies. Final and inspectable.',
    visual: 'settlement' as const,
  },
] as const

export const LIFECYCLE_STAGES = [
  { id: 'created', label: 'Created', status: 'complete' as const },
  { id: 'onchain', label: 'On-Chain', status: 'complete' as const },
  { id: 'matched', label: 'Matched', status: 'active' as const },
  { id: 'proof', label: 'Proof Gen', status: 'pending' as const },
  { id: 'verified', label: 'Verified', status: 'pending' as const },
  { id: 'settled', label: 'Settled', status: 'pending' as const },
] as const

export const COMMITMENT_CODE = `fn generate_commitment(
    order: &OrderInput,
    salt: Field,
) -> Field {
    let payload = poseidon_hash([
        order.amount,
        order.price,
        order.side,
        salt,
    ]);
    payload
}`

export const LANDING_LINKS = {
  launchApp: ROUTES.app,
  readCircuit: ROUTES.docs.circuitDiagram,
  protocol: ROUTES.docs.problem,
} as const
