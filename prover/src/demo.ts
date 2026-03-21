/**
 * Demo: match + prove + locally verify using the circuits/test vectors.
 * Does NOT submit on-chain unless SUBMIT_ON_CHAIN=1 and env vars are set.
 *
 *   npm run prove:demo
 */
import { runProver } from "./index";
import type { OrderCommitment } from "./types";

// Same field values as circuits/test/input.json and circuits/scripts/compute_commitments.js
const DEMO_ORDERS: OrderCommitment[] = [
  {
    commitmentHash:
      "0x2ad7ac4eb6e0c45cd5c8fe80538509d7316378c6bdb1ad722cf27079f3f60983",
    assetAmount: 2_500_000_000_000_000_000n,
    limitPrice: 3_421_000_000n,
    nonce: 847_291n,
    salt: 123_456_789_012_345_678_901_234_567_890n,
    trader: "0xA11CE000000000000000000000000000000000001",
    escrowAmount: 1_000_000_000_000_000_000n,
    submittedBlock: 1,
  },
  {
    commitmentHash:
      "0x2a6a3d6361c2e704474d31ddb2aeb30a3fe799dbfc9cacf5270ba2aeb8ab975b",
    assetAmount: 2_500_000_000_000_000_000n,
    limitPrice: 3_422_000_000n,
    nonce: 928_471n,
    salt: 987_654_321_098_765_432_109_876_543_210n,
    trader: "0xB0B00000000000000000000000000000000000002",
    escrowAmount: 1_000_000_000_000_000_000n,
    submittedBlock: 2,
  },
];

async function main() {
  const submitOnChain = process.env.SUBMIT_ON_CHAIN === "1";
  await runProver(DEMO_ORDERS, { submit: submitOnChain });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
