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

  Canonical commitment field order (must match browser + witness):
    [assetAmount, limitPrice, nonce, salt]

  All price/size comparisons use LessThan(64) / GreaterThan(64) from
  circomlib. This is mandatory — raw signal comparisons are NOT safe in
  Circom due to BN128 field arithmetic wrap-around. 64-bit range bounds
  every compared value below 2^64.

  No wallet addresses are inputs. The trader is bound to a commitment
  implicitly via the escrow deposit mapping in OrderBook.sol.
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
    // Poseidon(4).inputs is an array port — index each element.
    component hashA = Poseidon(4);
    hashA.inputs[0] <== assetAmount_A;
    hashA.inputs[1] <== limitPrice_A;
    hashA.inputs[2] <== nonce_A;
    hashA.inputs[3] <== salt_A;
    hashA.out === commitment_A;

    // ─── Commitment verification: Order B ──────────────────────────
    component hashB = Poseidon(4);
    hashB.inputs[0] <== assetAmount_B;
    hashB.inputs[1] <== limitPrice_B;
    hashB.inputs[2] <== nonce_B;
    hashB.inputs[3] <== salt_B;
    hashB.out === commitment_B;

    // ─── Price range check: clearingPrice >= limitPrice_A ──────────
    // LessThan(n).out == 1 iff in[0] < in[1].
    // limitPrice_A <= clearingPrice  ⇔  limitPrice_A < clearingPrice + 1
    component priceCheckA = LessThan(64);
    priceCheckA.in[0] <== limitPrice_A;
    priceCheckA.in[1] <== clearingPrice + 1;
    priceCheckA.out === 1;

    // ─── Price range check: clearingPrice <= limitPrice_B ──────────
    // clearingPrice <= limitPrice_B  ⇔  clearingPrice < limitPrice_B + 1
    component priceCheckB = LessThan(64);
    priceCheckB.in[0] <== clearingPrice;
    priceCheckB.in[1] <== limitPrice_B + 1;
    priceCheckB.out === 1;

    // ─── Size match: amounts must be equal ─────────────────────────
    assetAmount_A === assetAmount_B;

    // ─── Non-zero checks ───────────────────────────────────────────
    // GreaterThan(n).out == 1 iff in[0] > in[1]. Prevent zero-amount
    // and zero-price settlements.
    component amountNonZero = GreaterThan(64);
    amountNonZero.in[0] <== assetAmount_A;
    amountNonZero.in[1] <== 0;
    amountNonZero.out === 1;

    component priceNonZero = GreaterThan(64);
    priceNonZero.in[0] <== clearingPrice;
    priceNonZero.in[1] <== 0;
    priceNonZero.out === 1;
}

component main {public [commitment_A, commitment_B, clearingPrice]} = ShadowPoolMatch();
