use alloy::{
    primitives::Address,
    providers::{Provider, ProviderBuilder, WsConnect},
    rpc::types::Filter,
    sol,
    sol_types::SolEvent,
};
use anyhow::Result;
use futures::StreamExt;
use tracing::{info, warn};

use crate::types::{CommitmentEvent, WatcherConfig};

// Define the OrderBook event ABI using alloy's sol! macro.
// This automatically derives the correct keccak256 topic selector:
//   keccak256("CommitmentSubmitted(bytes32,address,uint256)")
//   = 0x92ab700b2c8a75de520cdba191321698970557b53d949921d0085961505a14ff
// and provides type-safe log decoding via SolEvent::decode_raw_log.
sol! {
    event CommitmentSubmitted(
        bytes32 indexed commitment,
        address indexed trader,
        uint256 blockNumber
    );
}

/// Watch for CommitmentSubmitted events on OrderBook.sol via WebSocket.
///
/// Calls `on_event` for every decoded event. `on_event` emits structured
/// JSON to stdout so the TypeScript prover can consume it by reading the
/// watcher's stdout stream.
///
/// The Rust watcher NEVER calls Node.js or snarkjs — proof generation is
/// entirely the TypeScript prover's responsibility (Part 9 constraint 4).
pub async fn watch_commitments(
    config: WatcherConfig,
    on_event: impl Fn(CommitmentEvent) + Send + Sync + 'static,
) -> Result<()> {
    info!("Connecting to Sepolia via WebSocket: {}", config.rpc_url);

    let ws = WsConnect::new(&config.rpc_url);
    let provider = ProviderBuilder::new().on_ws(ws).await?;

    let address: Address = config.order_book_address.parse()?;

    // Build the filter using the sol!-derived event selector so the topic
    // hash is always correct and cannot drift from the contract definition.
    let filter = Filter::new()
        .address(address)
        .event_signature(CommitmentSubmitted::SIGNATURE_HASH)
        .from_block(config.from_block);

    info!(
        "Watching CommitmentSubmitted on {} from block {}",
        address, config.from_block
    );

    let sub = provider.subscribe_logs(&filter).await?;
    let mut stream = sub.into_stream();

    // SubscriptionStream<Log> implements futures::Stream; use StreamExt::next().
    loop {
        match tokio::time::timeout(std::time::Duration::from_secs(30), stream.next()).await {
            Ok(Some(log)) => {
                // Decode using the sol!-generated type: topics() is &[B256],
                // log.data() is &LogData whose .data field is the ABI-encoded non-indexed payload.
                match CommitmentSubmitted::decode_raw_log(
                    log.topics(),
                    log.data().data.as_ref(),
                    true,
                ) {
                    Ok(decoded) => {
                        let event = CommitmentEvent {
                            commitment: format!("{:#x}", decoded.commitment),
                            trader: format!("{:#x}", decoded.trader),
                            block_number: log.block_number.unwrap_or_default(),
                            tx_hash: log
                                .transaction_hash
                                .map(|h| format!("{:#x}", h))
                                .unwrap_or_default(),
                        };

                        info!(
                            "CommitmentSubmitted: {} from {} at block {}",
                            event.commitment, event.trader, event.block_number
                        );

                        on_event(event);
                    }
                    Err(e) => {
                        warn!("Failed to decode CommitmentSubmitted log: {e}");
                    }
                }
            }
            Ok(None) => {
                info!("Log stream closed — reconnect required");
                break;
            }
            Err(_) => {
                // Timeout: no events in 30 s — normal on Sepolia testnet.
                info!("No new commitments in last 30s (still watching)");
            }
        }
    }

    Ok(())
}
