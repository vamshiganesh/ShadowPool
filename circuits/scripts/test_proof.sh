#!/bin/bash
set -e

echo "=== ShadowPool Proof Test ==="
echo ""

CIRCUIT_NAME="shadowpool_match"
CIRCUIT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$CIRCUIT_DIR/build"
TEST_DIR="$CIRCUIT_DIR/test"
SCRIPT_DIR="$CIRCUIT_DIR/scripts"

mkdir -p "$TEST_DIR"

# Step 0: Compute real Poseidon commitments and write test/input.json.
# This guarantees commitment_A / commitment_B match the circuit's
# Poseidon(4) over the canonical field order — no placeholder zeros.
echo "[0/3] Computing Poseidon commitments -> test/input.json"
node "$SCRIPT_DIR/compute_commitments.js"
echo ""

echo "[1/3] Generating witness..."
node "$BUILD_DIR/${CIRCUIT_NAME}_js/generate_witness.js" \
  "$BUILD_DIR/${CIRCUIT_NAME}_js/$CIRCUIT_NAME.wasm" \
  "$TEST_DIR/input.json" \
  "$TEST_DIR/witness.wtns"

echo ""
echo "[2/3] Generating proof..."
npx snarkjs groth16 prove \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  "$TEST_DIR/witness.wtns" \
  "$TEST_DIR/proof.json" \
  "$TEST_DIR/public.json"

echo ""
echo "[3/3] Verifying proof..."
npx snarkjs groth16 verify \
  "$BUILD_DIR/verification_key.json" \
  "$TEST_DIR/public.json" \
  "$TEST_DIR/proof.json"

echo ""
echo "=== Proof verified successfully ==="
echo ""
cat "$TEST_DIR/proof.json"
