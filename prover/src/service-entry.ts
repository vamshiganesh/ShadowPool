/**
 * Prover service entry point — called by the matcher worker via child_process.
 *
 * Reads a JSON array of PoolEntry objects from stdin, runs the full
 * Groth16 prove + settlement pipeline, then exits 0 on success or 1 on error.
 *
 * Usage (internal — do not call directly):
 *   node dist/service-entry.js < pool.json
 *   echo '[{...}]' | node dist/service-entry.js
 */
import { config } from "dotenv";
import { resolve } from "path";
import { runProver } from "./index";
import { isSubmitOnChainEnabled } from "./env";
import type { OrderCommitment } from "./types";

config({ path: resolve(__dirname, "../../.env") });

interface PoolEntry {
  commitmentHash: string;
  assetAmount: string;
  limitPrice: string;
  nonce: string;
  salt: string;
  trader: string;
  escrowAmount?: string;
  submittedBlock?: number;
}

function parsePoolEntry(raw: PoolEntry): OrderCommitment {
  return {
    commitmentHash: raw.commitmentHash,
    assetAmount: BigInt(raw.assetAmount),
    limitPrice: BigInt(raw.limitPrice),
    nonce: BigInt(raw.nonce),
    salt: BigInt(raw.salt),
    trader: raw.trader,
    escrowAmount: BigInt(raw.escrowAmount ?? raw.assetAmount),
    submittedBlock: raw.submittedBlock ?? 0,
  };
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on("data", (chunk: Buffer) => chunks.push(chunk));
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    process.stdin.on("error", reject);
  });
}

async function main() {
  const raw = await readStdin();

  let entries: PoolEntry[];
  try {
    entries = JSON.parse(raw) as PoolEntry[];
  } catch {
    console.error("[service-entry] Invalid JSON on stdin");
    process.exit(1);
  }

  if (!Array.isArray(entries) || entries.length < 2) {
    console.error("[service-entry] Need at least 2 pool entries");
    process.exit(1);
  }

  const orders = entries.map(parsePoolEntry);
  await runProver(orders, { submit: isSubmitOnChainEnabled() });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[service-entry] Fatal:", err);
    process.exit(1);
  });
