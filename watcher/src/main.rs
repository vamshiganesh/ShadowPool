mod queue;
mod types;
mod watcher;

use dotenv::dotenv;
use std::env;
use tracing::info;

use crate::queue::Queue;
use crate::types::WatcherConfig;
use crate::watcher::watch_commitments;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    info!("=== ShadowPool Watcher v1 ===");

    let config = WatcherConfig {
        rpc_url: env::var("SEPOLIA_WS_URL").expect("SEPOLIA_WS_URL required"),
        order_book_address: env::var("ORDER_BOOK_ADDRESS")
            .expect("ORDER_BOOK_ADDRESS required"),
        settlement_address: env::var("SETTLEMENT_ADDRESS")
            .expect("SETTLEMENT_ADDRESS required"),
        from_block: env::var("WATCHER_FROM_BLOCK")
            .unwrap_or_else(|_| "0".to_string())
            .parse()
            .unwrap_or(0),
    };

    info!("OrderBook:  {}", config.order_book_address);
    info!("Settlement: {}", config.settlement_address);
    info!("From block: {}", config.from_block);

    // In-memory queue for v1.
    // v2: replace with Redis pub/sub or NATS so the TS prover and Rust
    // watcher communicate across process boundaries.
    let queue = Queue::new();
    let queue_clone = queue.clone();

    // on_event emits structured JSON to stdout so the TypeScript prover
    // can consume events by reading the watcher's stdout stream.
    // The Rust component never calls Node.js or snarkjs directly
    // (Part 9 constraint 4: no subprocess shelling).
    watch_commitments(config, move |event| {
        // Push to in-memory queue (watcher-internal tracking).
        queue_clone.push(event.clone());

        // Emit JSON line to stdout for the TS prover to consume via pipe.
        let json = serde_json::to_string(&event).expect("serialize event");
        println!("EVENT:{json}");
    })
    .await?;

    Ok(())
}
