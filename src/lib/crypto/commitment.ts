import { buildPoseidon } from 'circomlibjs'

let poseidonInstance: Awaited<ReturnType<typeof buildPoseidon>> | null = null

async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon()
  }
  return poseidonInstance
}

export interface OrderInput {
  assetAmount: bigint // 18 decimal fixed-point (ETH)
  limitPrice: bigint // 6 decimal fixed-point (USDC)
  nonce: bigint // random 128-bit integer
  salt: bigint // uint256 entropy
}

/**
 * Compute Poseidon commitment for a private order.
 * Runs entirely in the browser via circomlibjs WASM — no network request.
 *
 * Canonical input order (MUST match circuits/shadowpool_match.circom
 * and prover/src/commitment.ts):
 *   [assetAmount, limitPrice, nonce, salt]
 */
export async function computeCommitment(order: OrderInput): Promise<string> {
  const poseidon = await getPoseidon()
  const F = poseidon.F

  const hash = poseidon([
    order.assetAmount,
    order.limitPrice,
    order.nonce,
    order.salt,
  ])

  // Match prover/src/commitment.ts formatting exactly.
  const decimal = F.toString(hash)
  return '0x' + BigInt(decimal).toString(16).padStart(64, '0')
}

/** Generate a secure random 128-bit nonce. */
export function generateNonce(): bigint {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return BigInt(
    '0x' + Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join(''),
  )
}

/** Generate a secure random uint256 salt. */
export function generateSalt(): bigint {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return BigInt(
    '0x' + Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join(''),
  )
}
