use alloy::{
    primitives::Address,
    providers::{Provider, ProviderBuilder, WsConnect},
    rpc::types::Filter,
    sol,
    sol_types::SolEvent,
};
use anyhow::Result;
use tracing::{info, warn};

use crate::types::{CommitmentEvent, WatcherConfig};

// Define the OrderBook event ABI using alloy's sol! macro.
// This automatically derives the correct keccak256 topic selector
// and provides type-safe log decoding.
//
// Event:
//   CommitmentSubmitted(bytes32 indexed commitment, address indexed trader, uint256 blockNumber)
//
// Actual keccak256 of the signature:
//   0x92ab700b2c8a75de520cdba191321698970557b53d949921d0085961505a14ff
sol! {
    event CommitmentSubmitted(
        bytes32 indexed commitment,
        address indexed trader,
        uint256 blockNumber
    );
}

/// Watch for CommitmentSubmitted events on OrderBook.sol via WebSocket.
/// Emits structured JSON to stdout per event so the TypeScript prover
/// can consume it by reading stdin or polling a shared file.
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

    // Build the filter from the sol!-derived event selector so the topic hash
    // is always correct and cannot drift from the contract definition.
    let filter = Filter::new()
        .address(address)
        .event_signature(CommitmentSubmitted::SIGNATURE_HASH)
        .from_block(config.from_block);

    info!(
        "Watching for CommitmentSubmitted on {} from block {}",
        address, config.from_block
    );

    let sub = provider.subscribe_logs(&filter).await?;
    let mut stream = sub.into_stream();

    loop {
        match tokio::time::timeout(std::time::Duration::from_secs(30), stream.recv()).await {
            Ok(Some(log)) => {
                // Decode the log using the sol!-generated type; this handles
                // indexed-topic extraction safely without manual byte slicing.
                match CommitmentSubmitted::decode_raw_log(
                    log.topics().to_vec(),
                    log.data().data.as_ref(),
                    true,
                ) {
                    Ok(decoded) => {
                        let event = CommitmentEvent {
                            commitment: format!("0x{:x}", decoded.commitment),
                            trader: format!("0x{:x}", decoded.trader),
                            block_number: log.block_number.unwrap_or_default(),
                            tx_hash: log
                                .transaction_hash
                                .map(|h| format!("{:?}", h))
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
