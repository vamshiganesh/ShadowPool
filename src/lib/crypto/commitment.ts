import type { OrderInput } from './commitmentInputs'

export type { OrderInput } from './commitmentInputs'
export { generateNonce, generateSalt } from './commitmentInputs'

type PoseidonInstance = {
  F: { toString: (value: unknown) => string }
  (inputs: bigint[]): unknown
}

let poseidonInstance: PoseidonInstance | null = null
let poseidonLoad: Promise<PoseidonInstance> | null = null

/** Load circomlibjs on demand — keeps ~2.8MB WASM out of the initial app bundle. */
async function getPoseidon(): Promise<PoseidonInstance> {
  if (poseidonInstance) return poseidonInstance
  if (!poseidonLoad) {
    poseidonLoad = import('circomlibjs').then(async ({ buildPoseidon }) => {
      poseidonInstance = (await buildPoseidon()) as PoseidonInstance
      return poseidonInstance
    })
  }
  return poseidonLoad
}

/** Warm WASM in the background after the app shell mounts. */
export function prefetchPoseidon(): void {
  void getPoseidon().catch(() => {
    /* optional — hash still loads on first compute */
  })
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
