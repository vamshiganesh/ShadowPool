import * as snarkjs from "snarkjs";
import * as path from "node:path";
import type { MatchedPair, Groth16Proof } from "./types";

const WASM_PATH = path.resolve(
  __dirname,
  "../../circuits/build/shadowpool_match_js/shadowpool_match.wasm",
);

const ZKEY_PATH = path.resolve(
  __dirname,
  "../../circuits/build/shadowpool_match_final.zkey",
);

export interface ProveResult {
  proof: Groth16Proof;
  publicSignals: string[];
}

/**
 * Build the circuit witness input from a matched pair.
 * Public signal order: [commitment_A, commitment_B, clearingPrice].
 */
export function buildWitnessInput(pair: MatchedPair): Record<string, string> {
  return {
    assetAmount_A: pair.orderA.assetAmount.toString(),
    limitPrice_A: pair.orderA.limitPrice.toString(),
    nonce_A: pair.orderA.nonce.toString(),
    salt_A: pair.orderA.salt.toString(),

    assetAmount_B: pair.orderB.assetAmount.toString(),
    limitPrice_B: pair.orderB.limitPrice.toString(),
    nonce_B: pair.orderB.nonce.toString(),
    salt_B: pair.orderB.salt.toString(),

    commitment_A: BigInt(pair.orderA.commitmentHash).toString(),
    commitment_B: BigInt(pair.orderB.commitmentHash).toString(),
    clearingPrice: pair.clearingPrice.toString(),
  };
}

/**
 * Generate a Groth16 proof for a matched pair.
 * Uses snarkjs as a library (no subprocess).
 */
export async function generateProof(pair: MatchedPair): Promise<ProveResult> {
  const input = buildWitnessInput(pair);

  console.log("[prover] Generating witness and proof via snarkjs.groth16.fullProve...");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    WASM_PATH,
    ZKEY_PATH,
  );

  console.log("[prover] Proof generated.");
  return { proof: proof as Groth16Proof, publicSignals };
}
