#!/bin/bash
set -e

echo "=== ShadowPool Circuit Compiler ==="
echo ""

CIRCUIT_NAME="shadowpool_match"
CIRCUIT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$CIRCUIT_DIR/build"

mkdir -p "$BUILD_DIR"

# Step 1: Compile the circuit
# NOTE: circom uses `-l <dir>` to add library/include search paths.
#       (There is no `--include` flag.) We add both the circuit root
#       (so `lib/poseidon.circom` resolves) and `lib/` (so transitive
#       includes like `poseidon_constants.circom` resolve).
echo "[1/5] Compiling $CIRCUIT_NAME.circom..."
circom "$CIRCUIT_DIR/$CIRCUIT_NAME.circom" \
  --r1cs \
  --wasm \
  --sym \
  --output "$BUILD_DIR" \
  -l "$CIRCUIT_DIR" \
  -l "$CIRCUIT_DIR/lib"

echo "      R1CS:  $BUILD_DIR/$CIRCUIT_NAME.r1cs"
echo "      WASM:  $BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm"
echo ""

# Step 2: Print constraint count
echo "[2/5] Constraint summary:"
npx snarkjs r1cs info "$BUILD_DIR/$CIRCUIT_NAME.r1cs"
echo ""

# Step 3: Download pot16 if not present
#
# The circuit (~1.7k constraints, well under 2^16 = 65,536) requires the
# pot16 powers-of-tau file. pot12 (4,096) is too small for the intended
# constraint envelope and MUST NOT be used.
#
# The original Hermez S3 bucket is deprecated (403 Access Denied). The
# official mirror is the Polygon zkEVM Google Cloud Storage bucket.
#   Legacy (dead): https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau
PTAU_FILE="$BUILD_DIR/pot16_final.ptau"
PTAU_URL="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_16.ptau"
# Expected BLAKE2b-512 (from snarkjs README) for integrity verification.
PTAU_B2SUM="6a6277a2f74e1073601b4f9fed6e1e55226917efb0f0db8a07d98ab01df1ccf43eb0e8c3159432acd4960e2f29fe84a4198501fa54c8dad9e43297453efec125"
if [ ! -f "$PTAU_FILE" ]; then
  echo "[3/5] Downloading pot16 ceremony file (Polygon zkEVM mirror)..."
  curl -fL "$PTAU_URL" -o "$PTAU_FILE"
else
  echo "[3/5] pot16_final.ptau already present. Skipping download."
fi
# Verify integrity when b2sum is available (non-fatal if tool missing).
if command -v b2sum >/dev/null 2>&1; then
  ACTUAL_B2="$(b2sum "$PTAU_FILE" | awk '{print $1}')"
  if [ "$ACTUAL_B2" != "$PTAU_B2SUM" ]; then
    echo "ERROR: pot16_final.ptau BLAKE2b mismatch — aborting." >&2
    echo "  expected: $PTAU_B2SUM" >&2
    echo "  actual:   $ACTUAL_B2" >&2
    exit 1
  fi
  echo "      pot16_final.ptau integrity verified (BLAKE2b OK)."
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
