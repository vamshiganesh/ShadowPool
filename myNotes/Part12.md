### My Instruction:

# Part 12 — TypeScript Prover Service

## Instruction to Cursor

Now build the TypeScript proving and matching service under `prover/`.

This service is responsible for:
- listening for matched commitment pairs (from the Rust watcher or an internal queue)
- generating witnesses
- generating Groth16 proofs via snarkjs
- submitting the `settle()` transaction to DarkPoolSettlement

---

## Initialize `prover/`

```bash
mkdir -p prover/src
cd prover
npm init -y
npm install snarkjs circomlibjs ethers dotenv
npm install -D typescript ts-node @types/node
npx tsc --init
```

---

## Write `prover/src/types.ts`

```typescript
export interface OrderCommitment {
  commitmentHash: string;     // bytes32 hex string (on-chain)
  assetAmount: bigint;
  limitPrice: bigint;
  nonce: bigint;
  salt: bigint;
  trader: string;             // wallet address
  escrowAmount: bigint;
  submittedBlock: number;
}

export interface MatchedPair {
  orderA: OrderCommitment;    // maker (bid)
  orderB: OrderCommitment;    // taker (ask)
  clearingPrice: bigint;
}

export interface Groth16Proof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
}

export interface ProofPackage {
  proof: Groth16Proof;
  publicSignals: string[];
  commitmentA: string;
  commitmentB: string;
  clearingPrice: bigint;
}
```

---

## Write `prover/src/commitment.ts`

```typescript
import { buildPoseidon } from "circomlibjs";
import type { OrderCommitment } from "./types";

let poseidonInstance: Awaited<ReturnType<typeof buildPoseidon>> | null = null;

async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

/// Compute the Poseidon commitment for an order.
/// Input order must match circuit input layout exactly:
/// [assetAmount, limitPrice, nonce, salt]
export async function computeCommitment(
  assetAmount: bigint,
  limitPrice: bigint,
  nonce: bigint,
  salt: bigint
): Promise<string> {
  const poseidon = await getPoseidon();
  const F = poseidon.F;

  const hash = poseidon([assetAmount, limitPrice, nonce, salt]);
  return "0x" + F.toString(hash, 16).padStart(64, "0");
}

/// Verify that an on-chain commitment matches the given order fields
export async function verifyCommitment(
  order: OrderCommitment
): Promise<boolean> {
  const computed = await computeCommitment(
    order.assetAmount,
    order.limitPrice,
    order.nonce,
    order.salt
  );
  return computed.toLowerCase() === order.commitmentHash.toLowerCase();
}
```

---

## Write `prover/src/matcher.ts`

```typescript
import type { OrderCommitment, MatchedPair } from "./types";

/// Find a matching pair from the open commitment pool.
/// Matching criteria (v1 simple):
///   - orderA.limitPrice <= clearingPrice <= orderB.limitPrice
///   - orderA.assetAmount === orderB.assetAmount
///   - clearingPrice = midpoint of the two limit prices
///
/// In v1, the private order details are revealed to the prover service.
/// In v2, MPC-based private matching replaces this.
export function findMatch(
  orders: OrderCommitment[]
): MatchedPair | null {

  for (let i = 0; i < orders.length; i++) {
    for (let j = i + 1; j < orders.length; j++) {
      const a = orders[i];
      const b = orders[j];

      // Skip same-direction orders
      // Assume A is bid (buyer, lower limitPrice) and B is ask (seller, higher limitPrice)
      const bid = a.limitPrice <= b.limitPrice ? a : b;
      const ask = a.limitPrice <= b.limitPrice ? b : a;

      // Size must match exactly in v1
      if (bid.assetAmount !== ask.assetAmount) continue;

      // Prices must overlap: bid >= ask means the spread is crossable
      if (bid.limitPrice < ask.limitPrice) continue;

      // Clearing price = midpoint (rounded down to 6 decimal precision)
      const clearingPrice = (bid.limitPrice + ask.limitPrice) / 2n;

      return {
        orderA: bid,
        orderB: ask,
        clearingPrice,
      };
    }
  }

  return null;
}
```

---

## Write `prover/src/witness.ts`

```typescript
import * as snarkjs from "snarkjs";
import * as path from "path";
import type { MatchedPair } from "./types";

const WASM_PATH = path.resolve(
  __dirname,
  "../../circuits/build/shadowpool_match_js/shadowpool_match.wasm"
);

const ZKEY_PATH = path.resolve(
  __dirname,
  "../../circuits/build/shadowpool_match_final.zkey"
);

/// Generate a Groth16 proof for a matched pair.
/// The snarkjs library handles witness generation and proving in one step.
export async function generateProof(pair: MatchedPair) {
  const input = {
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

  console.log("[prover] Generating witness and proof...");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    WASM_PATH,
    ZKEY_PATH
  );

  console.log("[prover] Proof generated.");
  return { proof, publicSignals };
}
```

---

## Write `prover/src/submitter.ts`

```typescript
import { ethers } from "ethers";
import * as snarkjs from "snarkjs";
import * as path from "path";
import type { MatchedPair, Groth16Proof } from "./types";
import addresses from "../../shared/addresses.json";

const SETTLEMENT_ABI = [
  "function settle(uint pA, uint pB, uint pC, bytes32 commitmentA, bytes32 commitmentB, uint256 clearingPrice) external"
];

/// Submit a verified proof to DarkPoolSettlement.sol
export async function submitSettlement(
  pair: MatchedPair,
  proof: Groth16Proof,
  publicSignals: string[]
) {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!);
  const signer = new ethers.Wallet(process.env.PROVER_PRIVATE_KEY!, provider);

  const settlement = new ethers.Contract(
    addresses.settlement,
    SETTLEMENT_ABI,
    signer
  );

  // Convert snarkjs proof format to Solidity calldata format
  const calldata = await snarkjs.groth16.exportSolidityCallData(
    proof,
    publicSignals
  );

  // Parse the calldata string into ABI-compatible arrays
  const argv = calldata
    .replace(/["[\]\s]/g, "")
    .split(",")
    .map((x: string) => BigInt(x));

  const pA: [bigint, bigint] = [argv, argv[1]];
  const pB: [[bigint, bigint], [bigint, bigint]] = [
    [argv, argv],
    [argv, argv],
  ];
  const pC: [bigint, bigint] = [argv, argv];

  console.log("[submitter] Submitting settlement tx to Sepolia...");

  const tx = await settlement.settle(
    pA, pB, pC,
    pair.orderA.commitmentHash,
    pair.orderB.commitmentHash,
    pair.clearingPrice
  );

  const receipt = await tx.wait();
  console.log("[submitter] Settled at block", receipt.blockNumber);
  console.log("[submitter] Tx hash:", receipt.hash);

  return receipt;
}
```

---

## Write `prover/src/index.ts`

```typescript
import "dotenv/config";
import { findMatch } from "./matcher";
import { generateProof } from "./witness";
import { submitSettlement } from "./submitter";
import { verifyCommitment } from "./commitment";
import type { OrderCommitment } from "./types";

/// v1 prover loop
/// In production, this subscribes to the Rust watcher via queue.
/// In v1 demo mode, it polls a shared in-memory order pool.
async function runProver(orders: OrderCommitment[]) {

  console.log("[prover] Starting ShadowPool prover service...");
  console.log(`[prover] Pool size: ${orders.length} open orders`);

  // Verify all commitments before attempting to match
  for (const order of orders) {
    const valid = await verifyCommitment(order);
    if (!valid) {
      console.warn(`[prover] Commitment mismatch for ${order.commitmentHash} — skipping`);
    }
  }

  const validOrders = orders; // filter invalid in production

  const pair = findMatch(validOrders);

  if (!pair) {
    console.log("[prover] No matching pair found.");
    return;
  }

  console.log(`[prover] Match found:`);
  console.log(`  A: ${pair.orderA.commitmentHash}`);
  console.log(`  B: ${pair.orderB.commitmentHash}`);
  console.log(`  Clearing price: ${pair.clearingPrice}`);

  const { proof, publicSignals } = await generateProof(pair);

  await submitSettlement(pair, proof as any, publicSignals);

  console.log("[prover] Settlement complete.");
}

export { runProver };
```

---

## Write `prover/src/queue.ts`

```typescript
/// Simple in-memory queue for v1 prover-watcher communication
/// Replace with Redis pub/sub or NATS in v2

type QueueMessage = {
  type: "new_commitment" | "match_ready";
  payload: unknown;
};

type Handler = (msg: QueueMessage) => void;

const handlers: Handler[] = [];
const queue: QueueMessage[] = [];

export function publish(msg: QueueMessage) {
  queue.push(msg);
  handlers.forEach((h) => h(msg));
}

export function subscribe(handler: Handler) {
  handlers.push(handler);
}
```

---

## Deliverables for this phase

1. Confirm `snarkjs` is called as a library, never via subprocess
2. Confirm `commitment.ts` input order matches circuit input order exactly
3. Confirm `matcher.ts` uses bigint arithmetic throughout
4. Confirm `submitter.ts` reads addresses from `shared/addresses.json`
5. Confirm `prover/src/index.ts` exports `runProver`

---

# End of Part 12

---


### Received Output:

Part 12 is complete. The TypeScript prover service builds, proves locally, and verifies — all via snarkjs as a library (no subprocess).
Files created (prover/)
prover/
 package.json
 tsconfig.json
 .env.example
 .gitignore
 src/
   types.ts
   commitment.ts      ← Poseidon [assetAmount, limitPrice, nonce, salt]
   matcher.ts
   witness.ts           ← snarkjs.groth16.fullProve
   prover.ts            ← proveMatch + verifyProofLocally
   calldata.ts          ← exportSolidityCallData parser
   submitter.ts         ← ethers settle() with correct ABI
   queue.ts
   index.ts             ← exports runProver
   demo.ts              ← local demo (circuits/test vectors)
   shims.d.ts           ← snarkjs / circomlibjs types
shared/
 addresses.json         ← placeholder (filled by Deploy.s.sol)
Fixes vs the prompt (would not work with Part 11 contracts)
Issue
Prompt
Fix
settle ABI
uint pA, uint pB, uint pC
uint256[2], uint256[2][2], uint256[2] (matches DarkPoolSettlement.sol)
Calldata parsing
broken argv indices
calldata.ts parses exportSolidityCallData via JSON.parse
Matcher overlap
if (bid.limitPrice < ask.limitPrice) continue skipped valid pairs
if (bid.limitPrice > ask.limitPrice) continue
Commitment hex
F.toString(hash, 16)
BigInt(F.toString(hash)).toString(16) (circomlibjs API)
Invalid orders
not filtered
runProver skips mismatched commitments
Process hang
—
demo.ts calls process.exit(0) after snarkjs (event loop stays open otherwise)

Demo run (verified)
cd prover && npm run prove:demo
Output:
2 orders matched (clearing 3421500000)
Groth16 proof generated (~2s)
Local snarkjs.groth16.verify → OK
Skips on-chain submit (default)
To submit on Sepolia after deploy:
# fill prover/.env from .env.example
SUBMIT_ON_CHAIN=1 npm run prove:demo
Deliverables checklist
snarkjs as library, never subprocess: ✅ groth16.fullProve, verify, exportSolidityCallData imported directly
commitment.ts field order matches circuit: ✅ [assetAmount, limitPrice, nonce, salt]
matcher.ts uses bigint throughout: ✅ all prices/amounts are bigint
submitter.ts reads shared/addresses.json: ✅ with placeholder guard
index.ts exports runProver: ✅ plus re-exports for matcher, witness, prover, queue
Usage
import { runProver } from "./index";
await runProver(orders, { submit: false }); // prove only
await runProver(orders, { submit: true });  // prove + broadcast settle()
Ready for Part 13 (Rust watcher) when you paste it — it will publish to queue.ts and the prover will consume matched pairs.
The first background demo run (708226) was aborted — it looked stuck because tail buffered output and snarkjs kept the Node process alive after proving finished.
A later run succeeded: match found, proof generated, local verification passed, on-chain submit skipped (as expected for the demo).
That hang is fixed — demo.ts now calls process.exit(0) after completion. A clean run finishes in ~3s with exit 0:
cd prover && npm run prove:demo








