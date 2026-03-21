import "dotenv/config";
import { findMatch } from "./matcher";
import { generateProof } from "./witness";
import { verifyProofLocally } from "./prover";
import { submitSettlement } from "./submitter";
import { verifyCommitment } from "./commitment";
import type { OrderCommitment } from "./types";

export interface RunProverOptions {
  /** When false, prove locally but do not broadcast a settlement tx. Default: true. */
  submit?: boolean;
}

/**
 * v1 prover loop.
 * In production, orders arrive from the Rust watcher via queue.ts.
 * In demo mode, pass a pre-built order pool.
 */
export async function runProver(
  orders: OrderCommitment[],
  options: RunProverOptions = {},
): Promise<void> {
  const shouldSubmit = options.submit ?? true;

  console.log("[prover] Starting ShadowPool prover service...");
  console.log(`[prover] Pool size: ${orders.length} open orders`);

  const validOrders: OrderCommitment[] = [];
  for (const order of orders) {
    const valid = await verifyCommitment(order);
    if (!valid) {
      console.warn(
        `[prover] Commitment mismatch for ${order.commitmentHash} — skipping`,
      );
      continue;
    }
    validOrders.push(order);
  }

  if (validOrders.length < 2) {
    console.log("[prover] Fewer than 2 valid orders — nothing to match.");
    return;
  }

  const pair = findMatch(validOrders);

  if (!pair) {
    console.log("[prover] No matching pair found.");
    return;
  }

  console.log("[prover] Match found:");
  console.log(`  A (bid):  ${pair.orderA.commitmentHash}`);
  console.log(`  B (ask):  ${pair.orderB.commitmentHash}`);
  console.log(`  Clearing: ${pair.clearingPrice}`);

  const { proof, publicSignals } = await generateProof(pair);

  const verified = await verifyProofLocally(proof, publicSignals);
  if (!verified) {
    throw new Error("[prover] Local snarkjs verification failed — aborting");
  }
  console.log("[prover] Local verification OK.");

  if (!shouldSubmit) {
    console.log("[prover] submit=false — skipping on-chain settlement.");
    return;
  }

  await submitSettlement(pair, proof, publicSignals);
  console.log("[prover] Settlement complete.");
}

export { findMatch } from "./matcher";
export { generateProof, buildWitnessInput } from "./witness";
export { proveMatch, verifyProofLocally } from "./prover";
export { computeCommitment, verifyCommitment } from "./commitment";
export { submitSettlement } from "./submitter";
export { publish, subscribe, drain, pendingCount } from "./queue";
export type * from "./types";
