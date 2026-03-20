import { buildPoseidon } from "circomlibjs";
import type { OrderCommitment } from "./types.js";

let poseidonInstance: Awaited<ReturnType<typeof buildPoseidon>> | null = null;

async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

/**
 * Compute the Poseidon commitment for an order.
 *
 * Canonical input order (MUST match circuits/shadowpool_match.circom,
 * circuits/scripts/compute_commitments.js, and future src/lib/crypto/commitment.ts):
 *   [assetAmount, limitPrice, nonce, salt]
 *
 * No wallet addresses are hashed into the commitment.
 */
export async function computeCommitment(
  assetAmount: bigint,
  limitPrice: bigint,
  nonce: bigint,
  salt: bigint,
): Promise<string> {
  const poseidon = await getPoseidon();
  const F = poseidon.F;

  const hash = poseidon([assetAmount, limitPrice, nonce, salt]);
  const decimal = F.toString(hash);
  return "0x" + BigInt(decimal).toString(16).padStart(64, "0");
}

/** Verify that an on-chain commitment matches the given order fields. */
export async function verifyCommitment(order: OrderCommitment): Promise<boolean> {
  const computed = await computeCommitment(
    order.assetAmount,
    order.limitPrice,
    order.nonce,
    order.salt,
  );
  return computed.toLowerCase() === order.commitmentHash.toLowerCase();
}
