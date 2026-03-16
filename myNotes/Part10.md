### My instruction:

# Part 10 — Circom Circuit

## Instruction to Cursor

Now write the ZK circuit.

Create all files under `circuits/`.

---

## Install circomlib dependency

Add circomlib as a submodule or copy the required files:

```bash
cd circuits
npm init -y
npm install circomlib
```

Create `circuits/lib/` and copy or symlink:
- `node_modules/circomlib/circuits/poseidon.circom`
- `node_modules/circomlib/circuits/comparators.circom`
- `node_modules/circomlib/circuits/bitify.circom`

---

## Write `circuits/shadowpool_match.circom`

```circom
pragma circom 2.0.0;

include "lib/poseidon.circom";
include "lib/comparators.circom";

/*
  ShadowPoolMatch circuit
  
  Proves that two committed orders are valid and price-compatible
  without revealing any order details.

  Private inputs:
    assetAmount_A, limitPrice_A, nonce_A, salt_A  — Order A fields
    assetAmount_B, limitPrice_B, nonce_B, salt_B  — Order B fields

  Public inputs:
    commitment_A  — Poseidon hash of Order A (on-chain)
    commitment_B  — Poseidon hash of Order B (on-chain)
    clearingPrice — agreed settlement price

  Constraints enforced:
    1. commitment_A === Poseidon(assetAmount_A, limitPrice_A, nonce_A, salt_A)
    2. commitment_B === Poseidon(assetAmount_B, limitPrice_B, nonce_B, salt_B)
    3. clearingPrice >= limitPrice_A (maker bid is satisfied)
    4. clearingPrice <= limitPrice_B (taker ask is satisfied)
    5. assetAmount_A === assetAmount_B (fill sizes match exactly)
    6. assetAmount_A > 0 (non-zero order)
    7. clearingPrice > 0 (non-zero price)

  All price comparisons use LessThan(64) from circomlib.
  This is mandatory — raw signal comparisons are NOT safe in Circom
  due to BN128 field arithmetic wrap-around.
*/

template ShadowPoolMatch() {

    // ─── Private inputs: Order A (maker/bid) ───────────────────────
    signal input assetAmount_A;
    signal input limitPrice_A;
    signal input nonce_A;
    signal input salt_A;

    // ─── Private inputs: Order B (taker/ask) ───────────────────────
    signal input assetAmount_B;
    signal input limitPrice_B;
    signal input nonce_B;
    signal input salt_B;

    // ─── Public inputs ─────────────────────────────────────────────
    signal input commitment_A;
    signal input commitment_B;
    signal input clearingPrice;

    // ─── Commitment verification: Order A ──────────────────────────
    component hashA = Poseidon(4);
    hashA.inputs <== assetAmount_A;
    hashA.inputs <== limitPrice_A;
    hashA.inputs <== nonce_A;
    hashA.inputs <== salt_A;
    hashA.out === commitment_A;

    // ─── Commitment verification: Order B ──────────────────────────
    component hashB = Poseidon(4);
    hashB.inputs <== assetAmount_B;
    hashB.inputs <== limitPrice_B;
    hashB.inputs <== nonce_B;
    hashB.inputs <== salt_B;
    hashB.out === commitment_B;

    // ─── Price range check: clearingPrice >= limitPrice_A ──────────
    // LessThan(n) outputs 1 if in < in, 0 otherwise
    // We want: limitPrice_A <= clearingPrice
    // i.e.: LessThan(limitPrice_A, clearingPrice + 1) === 1
    component priceCheckA = LessThan(64);
    priceCheckA.in <== limitPrice_A;
    priceCheckA.in <== clearingPrice + 1;
    priceCheckA.out === 1;

    // ─── Price range check: clearingPrice <= limitPrice_B ──────────
    // We want: clearingPrice <= limitPrice_B
    // i.e.: LessThan(clearingPrice, limitPrice_B + 1) === 1
    component priceCheckB = LessThan(64);
    priceCheckB.in <== clearingPrice;
    priceCheckB.in <== limitPrice_B + 1;
    priceCheckB.out === 1;

    // ─── Size match: amounts must be equal ─────────────────────────
    assetAmount_A === assetAmount_B;

    // ─── Non-zero checks ───────────────────────────────────────────
    // Prevent zero-amount and zero-price orders
    component amountNonZero = GreaterThan(64);
    amountNonZero.in <== assetAmount_A;
    amountNonZero.in <== 0;
    amountNonZero.out === 1;

    component priceNonZero = GreaterThan(64);
    priceNonZero.in <== clearingPrice;
    priceNonZero.in <== 0;
    priceNonZero.out === 1;
}

component main {public [commitment_A, commitment_B, clearingPrice]} = ShadowPoolMatch();
```

---

## Write `circuits/scripts/compile.sh`

```bash
#!/bin/bash
set -e

echo "=== ShadowPool Circuit Compiler ==="
echo ""

CIRCUIT_NAME="shadowpool_match"
CIRCUIT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$CIRCUIT_DIR/build"

mkdir -p "$BUILD_DIR"

# Step 1: Compile the circuit
echo "[1/5] Compiling $CIRCUIT_NAME.circom..."
circom "$CIRCUIT_DIR/$CIRCUIT_NAME.circom" \
  --r1cs \
  --wasm \
  --sym \
  --output "$BUILD_DIR" \
  --include "$CIRCUIT_DIR/lib"

echo "      R1CS:  $BUILD_DIR/$CIRCUIT_NAME.r1cs"
echo "      WASM:  $BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm"
echo ""

# Step 2: Print constraint count
echo "[2/5] Constraint summary:"
npx snarkjs r1cs info "$BUILD_DIR/$CIRCUIT_NAME.r1cs"
echo ""

# Step 3: Download pot16 if not present
PTAU_FILE="$CIRCUIT_DIR/build/pot16_final.ptau"
if [ ! -f "$PTAU_FILE" ]; then
  echo "[3/5] Downloading Hermez pot16 ceremony file..."
  curl -L "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau" \
    -o "$PTAU_FILE"
else
  echo "[3/5] pot16_final.ptau already present. Skipping download."
fi
echo ""

# Step 4: Generate zkey (Groth16 setup)
echo "[4/5] Running Groth16 trusted setup (circuit-specific phase 2)..."
npx snarkjs groth16 setup \
  "$BUILD_DIR/$CIRCUIT_NAME.r1cs" \
  "$PTAU_FILE" \
  "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey"

npx snarkjs zkey contribute \
  "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey" \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  --name="ShadowPool v1 contribution" \
  -v -e="$(openssl rand -hex 32)"

echo ""

# Step 5: Export verification key
echo "[5/5] Exporting verification key..."
npx snarkjs zkey export verificationkey \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  "$BUILD_DIR/verification_key.json"

echo ""
echo "=== Compilation complete ==="
echo ""
echo "Artifacts in $BUILD_DIR:"
ls -lh "$BUILD_DIR"
```

---

## Write `circuits/scripts/test_proof.sh`

```bash
#!/bin/bash
set -e

echo "=== ShadowPool Proof Test ==="
echo ""

CIRCUIT_NAME="shadowpool_match"
BUILD_DIR="$(cd "$(dirname "$0")/.." && pwd)/build"
TEST_DIR="$(cd "$(dirname "$0")/.." && pwd)/test"

mkdir -p "$TEST_DIR"

# Test input — two compatible orders
cat > "$TEST_DIR/input.json" << 'EOF'
{
  "assetAmount_A": "2500000000000000000",
  "limitPrice_A": "3421000000",
  "nonce_A": "847291",
  "salt_A": "123456789012345678901234567890",
  "assetAmount_B": "2500000000000000000",
  "limitPrice_B": "3422000000",
  "nonce_B": "928471",
  "salt_B": "987654321098765432109876543210",
  "commitment_A": "0",
  "commitment_B": "0",
  "clearingPrice": "3421500000"
}
EOF

# Note: commitment_A and commitment_B must be computed via circomlibjs
# before running this test. The script above uses placeholder zeros.
# Use `node circuits/scripts/compute_commitments.js` first.

echo "Generating witness..."
node "$BUILD_DIR/${CIRCUIT_NAME}_js/generate_witness.js" \
  "$BUILD_DIR/${CIRCUIT_NAME}_js/$CIRCUIT_NAME.wasm" \
  "$TEST_DIR/input.json" \
  "$TEST_DIR/witness.wtns"

echo ""
echo "Generating proof..."
npx snarkjs groth16 prove \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  "$TEST_DIR/witness.wtns" \
  "$TEST_DIR/proof.json" \
  "$TEST_DIR/public.json"

echo ""
echo "Verifying proof..."
npx snarkjs groth16 verify \
  "$BUILD_DIR/verification_key.json" \
  "$TEST_DIR/public.json" \
  "$TEST_DIR/proof.json"

echo ""
echo "=== Proof verified successfully ==="
echo ""
cat "$TEST_DIR/proof.json"
```

---

## Write `circuits/scripts/compute_commitments.js`

```js
const { buildPoseidon } = require("circomlibjs");

async function main() {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  // Order A
  const commitment_A = poseidon([
    BigInt("2500000000000000000"),  // assetAmount: 2.5 ETH
    BigInt("3421000000"),           // limitPrice: 3421.00 USDC (6 decimals)
    BigInt("847291"),               // nonce
    BigInt("123456789012345678901234567890") // salt
  ]);
  console.log("commitment_A:", F.toString(commitment_A));

  // Order B
  const commitment_B = poseidon([
    BigInt("2500000000000000000"),
    BigInt("3422000000"),           // taker willing to pay up to 3422.00
    BigInt("928471"),
    BigInt("987654321098765432109876543210")
  ]);
  console.log("commitment_B:", F.toString(commitment_B));
}

main().catch(console.error);
```

---

## Deliverables for this phase

At the end:
1. List all circuit files created
2. Confirm `compile.sh` uses `pot16_final.ptau`
3. Confirm `LessThan(64)` and `GreaterThan(64)` are used for all comparisons
4. Confirm no wallet addresses appear in the circuit
5. Confirm the public input list is exactly: `commitment_A`, `commitment_B`, `clearingPrice`

---

# End of Part 10

---

### Output Received:

Part 10 is complete and **verified end-to-end** — the circuit compiles, the trusted setup runs with pot16, and a real Groth16 proof generates and verifies.

## What I built

All files under `circuits/`:
- `shadowpool_match.circom` — the match circuit
- `lib/*.circom` — circomlib (full set copied so transitive includes resolve)
- `scripts/compile.sh` — compile + pot16 setup + vkey export
- `scripts/test_proof.sh` — witness → prove → verify
- `scripts/compute_commitments.js` — Poseidon commitments → `test/input.json`
- `package.json`, `.gitignore`

## Two corrections I made (the prompt's Circom would not compile)

1. **Array ports must be indexed.** `Poseidon(4).inputs`, `LessThan.in`, and `GreaterThan.in` are arrays. The prompt assigned them as scalars (`hashA.inputs <== ...` four times, `priceCheckA.in <== ...` twice), which is invalid Circom. I changed them to `inputs[0..3]` and `in[0]`/`in[1]`. **All constraints and your canonical field order are unchanged.**
2. **circom has no `--include` flag.** I used the real `-l <dir>` library-path flag in `compile.sh`.

Also: the **Hermez S3 ptau bucket is dead** (403). I switched the download to the official Polygon zkEVM GCS mirror (`storage.googleapis.com/zkevm/ptau/...`) and added a BLAKE2b integrity check.

## Verification results

| Check | Result |
|-------|--------|
| Circuit compiles (circom 2.2.3) | ✅ 1,746 constraints, 3 public / 8 private inputs |
| pot16 setup + zkey + vkey | ✅ all artifacts in `build/` |
| Happy-path proof generates & verifies | ✅ `groth16 verify` OK |
| Out-of-range `clearingPrice` rejected | ✅ witness gen fails (exit 1) |
| Browser/circuit hash parity | ✅ `compute_commitments.js` feeds the same Poseidon(4) the circuit checks |

## Deliverables checklist (from the prompt)

1. **Files created:** `shadowpool_match.circom`, `lib/` (circomlib), `scripts/compile.sh`, `scripts/test_proof.sh`, `scripts/compute_commitments.js`, `package.json`, `.gitignore`
2. **`compile.sh` uses `pot16_final.ptau`:** ✅ (downloads to `build/pot16_final.ptau`, referenced in setup; pot12 explicitly disallowed in comments)
3. **`LessThan(64)` / `GreaterThan(64)` for all comparisons:** ✅ — two `LessThan(64)` (price bounds) + two `GreaterThan(64)` (non-zero amount & price); equality uses `===`
4. **No wallet addresses in the circuit:** ✅ — inputs are only `assetAmount`, `limitPrice`, `nonce`, `salt` per order, plus public `commitment_A/B` and `clearingPrice`
5. **Public input list is exactly `commitment_A, commitment_B, clearingPrice`:** ✅ — `component main {public [commitment_A, commitment_B, clearingPrice]}`

## One note for later parts

Part 9 estimated ~18k–25k constraints (the basis for mandating pot16). The actual circuit is **~1.7k** (two Poseidon(4) hashes dominate). pot16 still works perfectly and stays future-proof, so I kept it as instructed — just be aware the real number is much smaller if you see it referenced elsewhere.

A side effect worth knowing: I installed the **Circom 2.2.3** compiler via `cargo install` (to `~/.cargo/bin/circom`) so I could verify compilation. The `build/` artifacts (incl. the 73 MB ptau and zkeys) are git-ignored.

Ready for **Part 11 (Solidity contracts)** whenever you paste it. Per our earlier plan, that's another part worth running on a stronger model + tests, since the verifier/settlement is funds-critical.