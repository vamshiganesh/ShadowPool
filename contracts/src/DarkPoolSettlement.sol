// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IVerifier} from "./interfaces/IVerifier.sol";
import {IOrderBook} from "./interfaces/IOrderBook.sol";
import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";

/// @title DarkPoolSettlement
/// @notice Verifies Groth16 proofs and atomically settles matched dark pool
///         orders.
/// @dev v1: standalone settlement contract. There is NO Uniswap v4 hook in v1;
///      that is a planned v2 milestone.
///
///      Escrow lives in OrderBook. This contract never custodies funds: after a
///      proof verifies, it instructs OrderBook to mark both commitments settled
///      and release each side's escrow to the counterparty.
contract DarkPoolSettlement is ReentrancyGuard {
    // ─── State ─────────────────────────────────────────────────────

    IVerifier public immutable verifier;
    IOrderBook public immutable orderBook;
    address public immutable owner;

    /// @notice Replay protection: a given proof can settle only once.
    mapping(bytes32 => bool) public usedProofs;
    /// @notice A given commitment pair can settle only once.
    mapping(bytes32 => bool) public settledPairs;

    // ─── Events ────────────────────────────────────────────────────

    event OrdersSettled(
        bytes32 indexed commitmentA,
        bytes32 indexed commitmentB,
        uint256 clearingPrice,
        address traderA,
        address traderB,
        uint256 settledBlock
    );

    // ─── Errors ────────────────────────────────────────────────────

    error ProofInvalid();
    error ProofAlreadyUsed();
    error PairAlreadySettled();
    error CommitmentANotFound();
    error CommitmentBNotFound();
    error IdenticalCommitments();

    // ─── Constructor ───────────────────────────────────────────────

    constructor(address _verifier, address _orderBook) {
        verifier = IVerifier(_verifier);
        orderBook = IOrderBook(_orderBook);
        owner = msg.sender;
    }

    // ─── Settlement ────────────────────────────────────────────────

    /// @notice Settle two matched orders using a Groth16 ZK proof.
    /// @param pA Groth16 pi_a.
    /// @param pB Groth16 pi_b.
    /// @param pC Groth16 pi_c.
    /// @param commitmentA On-chain commitment hash for order A.
    /// @param commitmentB On-chain commitment hash for order B.
    /// @param clearingPrice Agreed settlement price (6-decimal fixed point).
    ///
    /// @dev Public signal order MUST match the circuit / verification_key.json:
    ///      [commitment_A, commitment_B, clearingPrice].
    ///      Checks-Effects-Interactions: verify + mark settled (effects) happen
    ///      before any escrow transfer (interactions); also nonReentrant.
    function settle(
        uint[2] calldata pA,
        uint[2][2] calldata pB,
        uint[2] calldata pC,
        bytes32 commitmentA,
        bytes32 commitmentB,
        uint256 clearingPrice
    ) external nonReentrant {
        if (commitmentA == commitmentB) revert IdenticalCommitments();

        // ── Replay protection ───────────────────────────────────────
        // abi.encode (not encodePacked) because pB is a nested array.
        bytes32 proofHash = keccak256(abi.encode(pA, pB, pC));
        if (usedProofs[proofHash]) revert ProofAlreadyUsed();

        bytes32 pairKey = _pairKey(commitmentA, commitmentB);
        if (settledPairs[pairKey]) revert PairAlreadySettled();

        // ── Verify ZK proof ─────────────────────────────────────────
        uint[3] memory pubSignals =
            [uint256(commitmentA), uint256(commitmentB), clearingPrice];
        if (!verifier.verifyProof(pA, pB, pC, pubSignals)) revert ProofInvalid();

        // ── Resolve escrow / traders ────────────────────────────────
        (address traderA, uint256 escrowA) = orderBook.getEscrow(commitmentA);
        (address traderB, uint256 escrowB) = orderBook.getEscrow(commitmentB);
        if (traderA == address(0)) revert CommitmentANotFound();
        if (traderB == address(0)) revert CommitmentBNotFound();

        // ── Effects ─────────────────────────────────────────────────
        usedProofs[proofHash] = true;
        settledPairs[pairKey] = true;
        orderBook.markSettled(commitmentA);
        orderBook.markSettled(commitmentB);

        // ── Interactions: atomic escrow swap ────────────────────────
        // v1: native ETH swap of escrowed amounts. Each side's escrow is
        // released to the counterparty. v2: ERC20 + Uniswap v4 routing.
        orderBook.releaseEscrow(commitmentA, payable(traderB));
        orderBook.releaseEscrow(commitmentB, payable(traderA));

        emit OrdersSettled(
            commitmentA, commitmentB, clearingPrice, traderA, traderB, block.number
        );

        // silence unused-variable warnings while keeping names for clarity
        escrowA;
        escrowB;
    }

    /// @dev Order-independent key so (A,B) and (B,A) map to one slot.
    function _pairKey(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b
            ? keccak256(abi.encodePacked(a, b))
            : keccak256(abi.encodePacked(b, a));
    }
}
