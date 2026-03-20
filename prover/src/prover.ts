import * as snarkjs from "snarkjs";
import type { MatchedPair } from "./types.js";
import type { ProveResult } from "./witness.js";
import { generateProof } from "./witness.js";

/**
 * High-level proving entry point (Part 9 layout: prover/src/prover.ts).
 * Delegates to witness.ts — snarkjs is always called as a library.
 */
export async function proveMatch(pair: MatchedPair): Promise<ProveResult> {
  return generateProof(pair);
}

/** Local verification before on-chain submission (optional sanity check). */
export async function verifyProofLocally(
  proof: ProveResult["proof"],
  publicSignals: string[],
): Promise<boolean> {
  const vkeyPath = new URL(
    "../../circuits/build/verification_key.json",
    import.meta.url,
  );
  const vkey = await import(vkeyPath.href, { with: { type: "json" } }).then(
    (m) => m.default,
  );
  return snarkjs.groth16.verify(vkey, publicSignals, proof);
}
