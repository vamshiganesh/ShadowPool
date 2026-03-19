// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";

/// @title OrderBook
/// @notice Manages private order commitments and escrow for ShadowPool.
/// @dev Traders submit Poseidon commitment hashes without revealing order
///      details. Escrow is held here, per commitment. The settlement contract
///      (DarkPoolSettlement) is the only party allowed to mark a commitment
///      settled and release its escrow.
///
///      Privacy/binding model (Part 9): wallet addresses are NOT circuit inputs.
///      A trader is bound to a commitment ONLY through this escrow mapping
///      (commitment => trader), set at submission time.
contract OrderBook is ReentrancyGuard {
    // ─── Types ─────────────────────────────────────────────────────

    enum OrderStatus {
        None,
        OnChain,
        Matched,
        Settled,
        Cancelled
    }

    struct CommitmentRecord {
        address trader;
        uint256 escrowAmount; // native ETH held in escrow (v1)
        address escrowToken; // address(0) for native ETH (ERC20 is v2)
        uint256 submittedBlock;
        OrderStatus status;
    }

    // ─── State ─────────────────────────────────────────────────────

    /// @notice Authorized settlement contract. Set once via setSettlement.
    address public settlement;
    /// @notice Deployer; may set the settlement address exactly once.
    address public immutable owner;
    bool private _settlementSet;

    mapping(bytes32 => CommitmentRecord) public commitments;
    bytes32[] public commitmentList;

    // ─── Events ────────────────────────────────────────────────────

    event CommitmentSubmitted(
        bytes32 indexed commitment, address indexed trader, uint256 blockNumber
    );
    event CommitmentSettled(bytes32 indexed commitment, address indexed trader);
    event CommitmentCancelled(bytes32 indexed commitment, address indexed trader);
    event EscrowReleased(
        bytes32 indexed commitment, address indexed recipient, uint256 amount
    );
    event SettlementSet(address indexed settlement);

    // ─── Errors ────────────────────────────────────────────────────

    error CommitmentAlreadyExists();
    error CommitmentNotFound();
    error NotTrader();
    error NotOwner();
    error NotSettlementContract();
    error AlreadySettled();
    error NotCancellable();
    error EscrowTransferFailed();
    error SettlementAlreadySet();
    error ZeroAddress();

    // ─── Constructor ───────────────────────────────────────────────

    /// @param _settlement May be address(0) when using the two-step deploy
    ///        (deploy OrderBook, deploy settlement, then call setSettlement).
    constructor(address _settlement) {
        owner = msg.sender;
        if (_settlement != address(0)) {
            settlement = _settlement;
            _settlementSet = true;
            emit SettlementSet(_settlement);
        }
    }

    // ─── Admin ─────────────────────────────────────────────────────

    /// @notice Set the settlement contract address exactly once.
    /// @dev Resolves the OrderBook<->Settlement circular construction
    ///      dependency without making `settlement` mutable forever.
    function setSettlement(address _settlement) external {
        if (msg.sender != owner) revert NotOwner();
        if (_settlementSet) revert SettlementAlreadySet();
        if (_settlement == address(0)) revert ZeroAddress();
        settlement = _settlement;
        _settlementSet = true;
        emit SettlementSet(_settlement);
    }

    // ─── External: trader ──────────────────────────────────────────

    /// @notice Submit a commitment hash with native ETH escrow.
    /// @param commitment Poseidon hash of (assetAmount, limitPrice, nonce, salt).
    function submitCommitment(bytes32 commitment) external payable {
        if (commitments[commitment].trader != address(0)) {
            revert CommitmentAlreadyExists();
        }

        commitments[commitment] = CommitmentRecord({
            trader: msg.sender,
            escrowAmount: msg.value,
            escrowToken: address(0),
            submittedBlock: block.number,
            status: OrderStatus.OnChain
        });
        commitmentList.push(commitment);

        emit CommitmentSubmitted(commitment, msg.sender, block.number);
    }

    /// @notice Cancel own commitment and reclaim escrow.
    /// @dev Only the original trader, only before settlement. Funds are zeroed
    ///      before the external call (Checks-Effects-Interactions) and the call
    ///      is reentrancy-guarded.
    function cancelCommitment(bytes32 commitment) external nonReentrant {
        CommitmentRecord storage record = commitments[commitment];
        if (record.trader != msg.sender) revert NotTrader();
        if (record.status == OrderStatus.Settled) revert AlreadySettled();
        if (record.status == OrderStatus.Cancelled) revert NotCancellable();

        uint256 refund = record.escrowAmount;
        record.escrowAmount = 0;
        record.status = OrderStatus.Cancelled;

        (bool ok,) = msg.sender.call{value: refund}("");
        if (!ok) revert EscrowTransferFailed();

        emit CommitmentCancelled(commitment, msg.sender);
    }

    // ─── External: settlement only ─────────────────────────────────

    /// @notice Mark a commitment as settled. Settlement contract only.
    function markSettled(bytes32 commitment) external {
        if (msg.sender != settlement) revert NotSettlementContract();

        CommitmentRecord storage record = commitments[commitment];
        if (record.trader == address(0)) revert CommitmentNotFound();
        if (record.status == OrderStatus.Settled) revert AlreadySettled();

        record.status = OrderStatus.Settled;
        emit CommitmentSettled(commitment, record.trader);
    }

    /// @notice Release a settled commitment's escrow to `recipient`.
    /// @dev Settlement contract only. Escrow must have been marked Settled
    ///      first (enforced here), and amount is zeroed before transfer.
    /// @return amount The escrow amount transferred.
    function releaseEscrow(bytes32 commitment, address payable recipient)
        external
        nonReentrant
        returns (uint256 amount)
    {
        if (msg.sender != settlement) revert NotSettlementContract();
        if (recipient == address(0)) revert ZeroAddress();

        CommitmentRecord storage record = commitments[commitment];
        if (record.trader == address(0)) revert CommitmentNotFound();
        if (record.status != OrderStatus.Settled) revert NotSettlementContract();

        amount = record.escrowAmount;
        record.escrowAmount = 0;

        (bool ok,) = recipient.call{value: amount}("");
        if (!ok) revert EscrowTransferFailed();

        emit EscrowReleased(commitment, recipient, amount);
    }

    // ─── Views ─────────────────────────────────────────────────────

    /// @notice All open (OnChain) commitments — used by the off-chain matcher.
    function getOpenCommitments() external view returns (bytes32[] memory) {
        uint256 count;
        uint256 len = commitmentList.length;
        for (uint256 i = 0; i < len; i++) {
            if (commitments[commitmentList[i]].status == OrderStatus.OnChain) {
                count++;
            }
        }

        bytes32[] memory open = new bytes32[](count);
        uint256 idx;
        for (uint256 i = 0; i < len; i++) {
            if (commitments[commitmentList[i]].status == OrderStatus.OnChain) {
                open[idx++] = commitmentList[i];
            }
        }
        return open;
    }

    /// @notice Escrow held for a commitment.
    function getEscrow(bytes32 commitment)
        external
        view
        returns (address trader, uint256 amount)
    {
        CommitmentRecord storage record = commitments[commitment];
        return (record.trader, record.escrowAmount);
    }

    /// @notice Status of a commitment.
    function statusOf(bytes32 commitment) external view returns (OrderStatus) {
        return commitments[commitment].status;
    }

    /// @notice Number of commitments ever submitted.
    function commitmentCount() external view returns (uint256) {
        return commitmentList.length;
    }
}
