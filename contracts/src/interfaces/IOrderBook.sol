// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IOrderBook
/// @notice Minimal interface the settlement contract relies on.
interface IOrderBook {
    enum OrderStatus {
        None,
        OnChain,
        Matched,
        Settled,
        Cancelled
    }

    function getEscrow(bytes32 commitment)
        external
        view
        returns (address trader, uint256 amount);

    function statusOf(bytes32 commitment) external view returns (OrderStatus);

    function markSettled(bytes32 commitment) external;

    function releaseEscrow(bytes32 commitment, address payable recipient)
        external
        returns (uint256 amount);
}
