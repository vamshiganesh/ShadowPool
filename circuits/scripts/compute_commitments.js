/*
 * Computes Poseidon commitments for the two test orders and writes a
 * complete witness input file to circuits/test/input.json.
 *
 * Canonical field order (MUST match shadowpool_match.circom,
 * src/lib/crypto/commitment.ts, and prover/src/witness.ts):
 *
 *   [ assetAmount, limitPrice, nonce, salt ]
 *
 * Usage:
 *   node circuits/scripts/compute_commitments.js
 */
const fs = require("fs");
const path = require("path");
const { buildPoseidon } = require("circomlibjs");

// Two compatible orders. Same size; maker bid (3421.00) <= clearing
// (3421.50) <= taker ask (3422.00).
const ORDER_A = {
  assetAmount: "2500000000000000000", // 2.5 ETH (18 decimals)
  limitPrice: "3421000000",           // 3421.00 USDC (6 decimals)
  nonce: "847291",
  salt: "123456789012345678901234567890",
};

const ORDER_B = {
  assetAmount: "2500000000000000000",
  limitPrice: "3422000000",           // taker willing to pay up to 3422.00
  nonce: "928471",
  salt: "987654321098765432109876543210",
};

const CLEARING_PRICE = "3421500000";  // 3421.50 USDC

async function main() {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  const commit = (o) =>
    F.toString(
      poseidon([
        BigInt(o.assetAmount),
        BigInt(o.limitPrice),
        BigInt(o.nonce),
        BigInt(o.salt),
      ]),
    );

  const commitment_A = commit(ORDER_A);
  const commitment_B = commit(ORDER_B);

  console.log("commitment_A:", commitment_A);
  console.log("commitment_B:", commitment_B);

  const input = {
    assetAmount_A: ORDER_A.assetAmount,
    limitPrice_A: ORDER_A.limitPrice,
    nonce_A: ORDER_A.nonce,
    salt_A: ORDER_A.salt,
    assetAmount_B: ORDER_B.assetAmount,
    limitPrice_B: ORDER_B.limitPrice,
    nonce_B: ORDER_B.nonce,
    salt_B: ORDER_B.salt,
    commitment_A,
    commitment_B,
    clearingPrice: CLEARING_PRICE,
  };

  const outPath = path.join(__dirname, "..", "test", "input.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(input, null, 2));
  console.log("\nWrote", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
