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
PTAU_FILE="$BUILD_DIR/pot16_final.ptau"
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
