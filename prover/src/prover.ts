import * as snarkjs from "snarkjs";
import * as fs from "node:fs";
import * as path from "node:path";
import type { MatchedPair, Groth16Proof } from "./types";
import { generateProof } from "./witness";

const VKEY_PATH = path.resolve(
  __dirname,
  "../../circuits/build/verification_key.json",
);

export type { ProveResult } from "./witness";
export { generateProof } from "./witness";

/**
 * High-level proving entry point (Part 9 layout: prover/src/prover.ts).
 * Delegates to witness.ts — snarkjs is always called as a library.
 */
export async function proveMatch(pair: MatchedPair) {
  return generateProof(pair);
}

/** Local verification before on-chain submission (optional sanity check). */
export async function verifyProofLocally(
  proof: Groth16Proof,
  publicSignals: string[],
): Promise<boolean> {
  const vkey = JSON.parse(fs.readFileSync(VKEY_PATH, "utf8"));
  return snarkjs.groth16.verify(vkey, publicSignals, proof);
}
