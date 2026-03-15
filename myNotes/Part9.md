# ShadowPool — Backend Build Orchestration (Parts 9–16)

> This document continues from the 8-part frontend build.
> The frontend lives in `src/` and is already scaffolded.
> These parts cover the ZK circuit, Solidity contracts, TypeScript prover service, Rust watcher, integration layer, and deployment.
>
> **Do not paste all parts at once.**
> Paste one part at a time. Wait for it to complete. Then continue.

---

# Part 9 — Backend Context Lock

## Instruction to Cursor

You are continuing work on **ShadowPool** — a ZK dark pool trading protocol for Ethereum.

The frontend is already built in `src/`.

This prompt is **context-only**. Do not write any code yet.

Read everything carefully. Respond only with:

`OK`

---

## What you are about to build

The backend of ShadowPool has four components:

### 1. `circuits/` — Circom ZK circuit
The circuit proves that two committed orders are valid and compatible without revealing order details.

### 2. `contracts/` — Solidity smart contracts
Two contracts:
- `OrderBook.sol` — stores on-chain commitment hashes and manages escrow
- `DarkPoolSettlement.sol` — verifies Groth16 proofs and executes atomic settlement

There is **no Uniswap v4 hook in v1**.
A standalone settlement contract is the correct v1 approach.
The Uniswap v4 hook is a planned v2 milestone noted in the README.

### 3. `prover/` — TypeScript proving service
A Node.js/TypeScript service that:
- watches for matched commitment pairs from the matcher,
- generates witnesses using snarkjs,
- generates Groth16 proofs,
- submits settlement transactions to the Solidity verifier.

Proof generation lives in TypeScript/Node because snarkjs is a native TypeScript library and runs reliably in Node without subprocess fragility.

### 4. `watcher/` — Rust on-chain event watcher
A Rust binary that:
- subscribes to Sepolia events from `OrderBook.sol`,
- reads new commitment submissions,
- passes them to the TypeScript matching + proving service,
- submits signed settlement transactions on-chain.

The Rust component is responsible for **event watching and transaction submission**.
The TypeScript component is responsible for **proof generation**.
They communicate via a local message queue (Redis or in-memory channel in v1).

---

## Critical technical constraints

### Constraint 1 — Range checks are mandatory
All price comparisons inside the Circom circuit MUST use `LessThan(n)` components from `circomlib/comparators.circom`.

Raw signal comparisons like `signal_a >= signal_b` are NOT safe in Circom.
Circom signals are field elements — they can wrap around the BN128 field.
A malicious prover can satisfy unconstrained comparisons with wrapped values.

This is a real vulnerability. Every ZK engineer at a target company will check for this.

The fix: always use `LessThan(64)` from circomlib for price and size comparisons.

### Constraint 2 — Wallet addresses are NOT circuit inputs
Removing `makerAddress` and `takerAddress` from the circuit eliminates a linkability surface.

The commitment binds to the trader implicitly through the escrow deposit mapping in `OrderBook.sol`.

The circuit only proves:
1. Both commitments are validly formed Poseidon hashes
2. Price conditions are mutually satisfiable
3. Order sizes are compatible

This is simpler, cleaner, and avoids a privacy design critique from ZK reviewers.

### Constraint 3 — Use pot16 for the trusted setup
The circuit has approximately 18,000–25,000 constraints.
`pot12_final.ptau` only supports up to 2^12 = 4,096 constraints.
Using it will cause a silent failure during `groth16 setup`.

The correct file is `pot16_final.ptau` from the Hermez ceremony.
Download URL: `https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau`

All compile scripts must explicitly reference `pot16_final.ptau`.

### Constraint 4 — No subprocess shelling
The TypeScript prover must call `snarkjs` as a library, not via `std::process::Command`.
The Rust watcher must never shell out to Node.js.
Interprocess communication should use a message queue, not shell pipes.

### Constraint 5 — Commitment hash uses Poseidon
The browser commitment (computed via `circomlibjs`) and the circuit commitment (computed via `poseidon.circom`) must produce identical outputs for the same inputs.

The input field layout must be consistent across:
- `src/lib/crypto/commitment.ts` (browser, circomlibjs)
- `circuits/shadowpool_match.circom` (Circom circuit)
- `prover/src/witness.ts` (witness generation)

The canonical input order is:
1. `assetAmount` — uint256, 18 decimal fixed-point
2. `limitPrice` — uint256, 6 decimal fixed-point
3. `nonce` — uint128 random value
4. `salt` — uint256 derived from block hash at submission time

No wallet addresses in the commitment.

---

## Repository structure target

After all backend parts are complete, the repo should look like:

```txt
ShadowPool/
  src/                         ← existing frontend (Vite/React)
  circuits/
    shadowpool_match.circom
    lib/
      poseidon.circom           ← from circomlib
      comparators.circom        ← from circomlib
    build/
      shadowpool_match.r1cs
      shadowpool_match.wasm
      shadowpool_match_final.zkey
      verification_key.json
    scripts/
      compile.sh
      setup.sh
      test_proof.sh
  contracts/
    src/
      OrderBook.sol
      DarkPoolSettlement.sol
      interfaces/
        IOrderBook.sol
        IVerifier.sol
    test/
      OrderBook.t.sol
      DarkPoolSettlement.t.sol
    script/
      Deploy.s.sol
    foundry.toml
    remappings.txt
  prover/
    src/
      index.ts
      matcher.ts
      witness.ts
      prover.ts
      submitter.ts
      queue.ts
      types.ts
    package.json
    tsconfig.json
  watcher/
    src/
      main.rs
      watcher.rs
      submitter.rs
      types.rs
      queue.rs
    Cargo.toml
  shared/
    abis/
      OrderBook.json
      DarkPoolSettlement.json
    addresses.json
    commitment-inputs.schema.json
  .env.example
  README.md
```

---

## v1 Scope Gate

v1 ships when:
1. Circuit compiles and generates a valid proof
2. `DarkPoolSettlement.sol` verifies the proof on Sepolia
3. The `/app` frontend connects and submits a real commitment
4. A matched pair can be proved and settled end-to-end on Sepolia
5. The demo works with mocked orders if needed, but the proof pipeline must be real

Everything else (`/stats`, `/orders`, mobile, docs interactivity) is v2.

---

## What the next parts will cover

- Part 10: Circom circuit
- Part 11: Solidity contracts
- Part 12: Circom compile and trusted setup scripts
- Part 13: TypeScript prover service
- Part 14: Rust watcher
- Part 15: Frontend integration layer
- Part 16: Deployment and README

Do not code yet. Respond with:

`OK`

---

# End of Part 9

---
