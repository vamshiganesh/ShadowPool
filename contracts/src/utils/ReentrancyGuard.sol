// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ReentrancyGuard
/// @notice Minimal reentrancy guard (transient-free, storage-based) to avoid an
///         external dependency in v1. Functionally equivalent to OpenZeppelin's.
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status = _NOT_ENTERED;

    error ReentrantCall();

    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        if (_status == _ENTERED) revert ReentrantCall();
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        _status = _NOT_ENTERED;
    }
}
