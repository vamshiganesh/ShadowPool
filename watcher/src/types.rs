use serde::{Deserialize, Serialize};

/// A decoded CommitmentSubmitted event from OrderBook.sol.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitmentEvent {
    /// bytes32 hex — Poseidon(assetAmount, limitPrice, nonce, salt)
    pub commitment: String,
    /// trader address hex — bound via escrow mapping, NOT a circuit input
    pub trader: String,
    pub block_number: u64,
    pub tx_hash: String,
}

/// Runtime configuration loaded from environment variables.
#[derive(Debug, Clone)]
pub struct WatcherConfig {
    pub rpc_url: String,
    pub order_book_address: String,
    pub settlement_address: String,
    /// First block to scan (use deployment block to avoid scanning genesis).
    pub from_block: u64,
}
