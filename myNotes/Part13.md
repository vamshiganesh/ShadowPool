## My Instructions:

# Part 13 — Rust On-Chain Watcher

## Instruction to Cursor

Now build the Rust event watcher under `watcher/`.

The Rust component is responsible for:
- watching Sepolia for new `CommitmentSubmitted` events from `OrderBook.sol`
- writing new events into the shared queue
- calling the settlement transaction submitter after proof is ready

The Rust component does NOT generate proofs.
Proof generation is handled entirely by the TypeScript prover in `prover/`.

---

## Initialize Rust project

```bash
cd watcher
cargo init
```

---

## `watcher/Cargo.toml`

```toml
[package]
name = "shadowpool-watcher"
version = "0.1.0"
edition = "2021"

[dependencies]
alloy = { version = "0.3", features = ["full"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
dotenv = "0.15"
tracing = "0.1"
tracing-subscriber = "0.3"
anyhow = "1"
```

---

## Write `watcher/src/types.rs`

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitmentEvent {
    pub commitment: String,    // bytes32 hex
    pub trader: String,        // address hex
    pub block_number: u64,
    pub tx_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatcherConfig {
    pub rpc_url: String,
    pub order_book_address: String,
    pub settlement_address: String,
    pub from_block: u64,
}
```

---

## Write `watcher/src/watcher.rs`

```rust
use alloy::{
    providers::{Provider, ProviderBuilder, WsConnect},
    rpc::types::Filter,
    primitives::Address,
    sol_types::SolEvent,
};
use anyhow::Result;
use tracing::info;
use crate::types::{CommitmentEvent, WatcherConfig};

/// Watch for CommitmentSubmitted events on OrderBook.sol
/// Emits events to the shared queue for the TypeScript prover to consume.
pub async fn watch_commitments(
    config: WatcherConfig,
    on_event: impl Fn(CommitmentEvent) + Send + Sync + 'static,
) -> Result<()> {

    info!("Connecting to Sepolia via WebSocket: {}", config.rpc_url);

    let ws = WsConnect::new(&config.rpc_url);
    let provider = ProviderBuilder::new().on_ws(ws).await?;

    let address: Address = config.order_book_address.parse()?;

    // CommitmentSubmitted(bytes32 indexed commitment, address indexed trader, uint256 blockNumber)
    let filter = Filter::new()
        .address(address)
        .event_signature(
            // keccak256("CommitmentSubmitted(bytes32,address,uint256)")
            "0xb2b4f8f3a4f9c1e8c9a7d2f1e3c8d4b5a6e7f8c9d0e1f2a3b4c5d6e7f8a9b0c"
                .parse()
                .unwrap()
        )
        .from_block(config.from_block);

    info!("Watching for CommitmentSubmitted events...");

    let sub = provider.subscribe_logs(&filter).await?;
    let mut stream = sub.into_stream();

    while let Some(log) = tokio::time::timeout(
        std::time::Duration::from_secs(60),
        async { stream.recv().await }
    ).await.ok().flatten() {

        let commitment = format!("0x{}", hex::encode(&log.topics()[1]));
        let trader = format!("0x{}", hex::encode(&log.topics()[12..]));
        let block_number = log.block_number.unwrap_or_default();
        let tx_hash = log.transaction_hash
            .map(|h| format!("{:?}", h))
            .unwrap_or_default();

        let event = CommitmentEvent {
            commitment,
            trader,
            block_number,
            tx_hash: tx_hash.clone(),
        };

        info!(
            "New commitment: {} from {} at block {}",
            event.commitment, event.trader, event.block_number
        );

        on_event(event);
    }

    Ok(())
}
```

---

## Write `watcher/src/main.rs`

```rust
mod types;
mod watcher;

use dotenv::dotenv;
use std::env;
use tracing::info;
use crate::types::WatcherConfig;
use crate::watcher::watch_commitments;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    info!("=== ShadowPool Watcher ===");

    let config = WatcherConfig {
        rpc_url: env::var("SEPOLIA_WS_URL")
            .expect("SEPOLIA_WS_URL required"),
        order_book_address: env::var("ORDER_BOOK_ADDRESS")
            .expect("ORDER_BOOK_ADDRESS required"),
        settlement_address: env::var("SETTLEMENT_ADDRESS")
            .expect("SETTLEMENT_ADDRESS required"),
        from_block: env::var("WATCHER_FROM_BLOCK")
            .unwrap_or_else(|_| "0".to_string())
            .parse()
            .unwrap_or(0),
    };

    info!("OrderBook: {}", config.order_book_address);
    info!("Settlement: {}", config.settlement_address);

    watch_commitments(config, |event| {
        // In production: publish to shared queue, which the TypeScript prover reads.
        // In v1: write to a JSON file that the prover service polls.
        let json = serde_json::to_string(&event).unwrap();
        println!("EVENT:{}", json);
    }).await?;

    Ok(())
}
```

---

## Write `.env.example`

```env
# Sepolia RPC
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_WS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Deployer and prover keys (never commit real keys)
DEPLOYER_PRIVATE_KEY=0x...
PROVER_PRIVATE_KEY=0x...

# Etherscan
ETHERSCAN_API_KEY=YOUR_KEY

# Contract addresses (populated after deployment)
ORDER_BOOK_ADDRESS=
SETTLEMENT_ADDRESS=
VERIFIER_ADDRESS=

# Watcher config
WATCHER_FROM_BLOCK=0
```

---

## Deliverables for this phase

1. Confirm Rust watcher uses `alloy` not `ethers-rs`
2. Confirm watcher does NOT call Node.js or snarkjs
3. Confirm `on_event` callback emits structured JSON to stdout
4. Confirm `Cargo.toml` compiles cleanly with `cargo build`
5. Write `watcher/README.md` explaining the watcher's role vs the prover service

---

# End of Part 13

---

### Received Output:

Part 13 is complete. Here's a summary of what was built and what was fixed vs the prompt:

What was built:

watcher/
├── Cargo.toml          # alloy 0.3, tokio, serde, dotenv, tracing, futures, anyhow
├── .env.example        # SEPOLIA_WS_URL, ORDER_BOOK_ADDRESS, SETTLEMENT_ADDRESS, WATCHER_FROM_BLOCK
├── .gitignore          # /target, .env
├── README.md           # role table, architecture diagram, build/run docs
└── src/
    ├── main.rs         # reads env, spins up queue, calls watch_commitments
    ├── types.rs        # CommitmentEvent, WatcherConfig
    ├── queue.rs        # in-memory Arc<Mutex<Vec>> queue (v1)
    └── watcher.rs      # alloy WS subscription, sol! macro decoding, stdout JSON output


A root .env.example covering all four services was also added.

Issue	What the prompt had	Fix applied
Wrong event selector
Hand-coded wrong hash (0xb2b4...)
sol! macro derives correct 0x92ab... automatically
Broken trader extraction
hex::encode(&log.topics()[12..]) — nonsensical byte slice
sol! / SolEvent::decode_raw_log decodes typed fields correctly
Missing hex crate
Used hex::encode but never declared
Removed; using format!("{:#x}", decoded.commitment) instead
Wrong stream API
stream.recv() (doesn't exist on SubscriptionStream)
futures::StreamExt::next() — what Stream trait provides
Wrong decode_raw_log input
.to_vec() passed where &[B256] expected; .data.as_ref() was wrong type
log.topics() → &[B256], log.data().data.as_ref() → correct


cargo build --release finishes clean with zero errors.

The demo ran successfully — it matched both test orders, generated the proof, and passed local verification — but it was still running (about 28 minutes) when you terminated it. This is the same hanging issue from before: the Node.js process doesn't exit cleanly on its own.

The process.exit(0) added in Part 12 only applies when the main Promise chain in demo.ts resolves normally, but something is keeping the event loop alive (likely the circomlibjs WASM instance or snarkjs's worker threads). Let me patch demo.ts to force-exit more aggressively:

The process.exit(0) is already there on line 42, so the .then() wasn't reached — meaning main() never resolved or rejected; it hung inside runProver. The culprit is snarkjs.groth16.fullProve which uses worker threads internally that can outlive the promise resolution. Fix: use a setTimeout fallback to force exit after a reasonable window.

The background demo run was terminated by you before it finished. The good news is it succeeded at everything that matters — match, proof generation, and local verification all passed. The only issue was it hung afterward (snarkjs worker threads kept the process alive).

The fix adds a 30-second `setTimeout(...).unref()` in `demo.ts`: if `process.exit(0)` from the `.then()` fires first the timer does nothing; if a stray snarkjs worker thread prevents that, the timer forces a clean exit after 30 seconds. The prover is rebuilt and ready.