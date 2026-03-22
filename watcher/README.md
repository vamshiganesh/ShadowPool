# ShadowPool Watcher

Rust service that watches Sepolia for `CommitmentSubmitted` events emitted by `OrderBook.sol` and streams them as structured JSON to the TypeScript prover.

---

## Role vs TypeScript Prover

| Concern | Rust Watcher (`watcher/`) | TS Prover (`prover/`) |
|---|---|---|
| Chain event ingestion | ✅ WebSocket subscription via alloy | ❌ |
| Order matching | ❌ | ✅ |
| ZK proof generation | ❌ never — no snarkjs | ✅ snarkjs + circomlibjs |
| On-chain settlement tx | ❌ | ✅ ethers.js |
| Inter-service output | `println!("EVENT:{json}")` to stdout | reads stdin / polls shared file |

The watcher is a pure event relay. It never shells out to Node.js or snarkjs (Part 9 constraint 4).

---

## Architecture

```
Sepolia RPC (WebSocket)
        │  CommitmentSubmitted events
        ▼
  shadowpool-watcher  ──► stdout: EVENT:{...json...}
        │                        │
        │                        ▼
        │                 TypeScript prover
        │                 (matcher → witness → snarkjs proof → ethers submit)
        │
        ▼
  In-memory Queue (v1)
  (replace with Redis pub/sub in v2)
```

---

## Building

```bash
cd watcher
cargo build              # debug
cargo build --release    # optimised binary → target/release/shadowpool-watcher
```

Requires Rust 1.75+ (edition 2021).

---

## Configuration

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `SEPOLIA_WS_URL` | Yes | WebSocket RPC (e.g. `wss://eth-sepolia.g.alchemy.com/v2/KEY`) |
| `ORDER_BOOK_ADDRESS` | Yes | Deployed `OrderBook.sol` address |
| `SETTLEMENT_ADDRESS` | Yes | Deployed `DarkPoolSettlement.sol` address |
| `WATCHER_FROM_BLOCK` | No | First block to scan; defaults to `0` |

---

## Running

```bash
cp ../.env.example .env   # or create watcher/.env
# fill in SEPOLIA_WS_URL, ORDER_BOOK_ADDRESS, SETTLEMENT_ADDRESS

cargo run
# or after release build:
./target/release/shadowpool-watcher
```

Pipe stdout to the TypeScript prover for integrated operation:

```bash
cargo run | node ../prover/dist/index.js
```

---

## Event output format

Each `CommitmentSubmitted` event is printed as one JSON line prefixed with `EVENT:`:

```
EVENT:{"commitment":"0xabc...","trader":"0x123...","block_number":7654321,"tx_hash":"0xdef..."}
```

The TypeScript prover reads these lines, verifies the commitment hash (Poseidon canonical order: `assetAmount, limitPrice, nonce, salt`), runs the matcher, generates a Groth16 proof, and submits the `settle()` transaction.

---

## Key implementation notes

- Uses **alloy 0.3** (not ethers-rs) for all Ethereum interaction.
- Event selector is derived by the `sol!` macro from the canonical signature  
  `CommitmentSubmitted(bytes32,address,uint256)` →  
  `0x92ab700b2c8a75de520cdba191321698970557b53d949921d0085961505a14ff`  
  so it cannot drift from the deployed contract.
- Decoding uses `SolEvent::decode_raw_log` — no manual byte slicing.
- A 30-second `tokio::time::timeout` keeps the loop alive on quiet testnets.
- v1 queue is in-memory (`queue.rs`); replace with Redis pub/sub in v2.
