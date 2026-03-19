// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {OrderBook} from "../src/OrderBook.sol";

contract OrderBookTest is Test {
    OrderBook public orderBook;
    address public settlement = address(0xBEEF);
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    function setUp() public {
        orderBook = new OrderBook(settlement);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function test_submitCommitment() public {
        bytes32 commitment = keccak256("test_order_alice");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(commitment);

        (address trader, uint256 amount) = orderBook.getEscrow(commitment);
        assertEq(trader, alice);
        assertEq(amount, 1 ether);
        assertEq(
            uint256(orderBook.statusOf(commitment)),
            uint256(OrderBook.OrderStatus.OnChain)
        );
    }

    function test_cannotSubmitDuplicate() public {
        bytes32 commitment = keccak256("test_order_alice");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(commitment);

        vm.prank(bob);
        vm.expectRevert(OrderBook.CommitmentAlreadyExists.selector);
        orderBook.submitCommitment{value: 1 ether}(commitment);
    }

    function test_cancelCommitment() public {
        bytes32 commitment = keccak256("test_order_alice");
        vm.prank(alice);
        orderBook.submitCommitment{value: 2 ether}(commitment);

        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        orderBook.cancelCommitment(commitment);

        assertEq(alice.balance, balanceBefore + 2 ether);
        assertEq(
            uint256(orderBook.statusOf(commitment)),
            uint256(OrderBook.OrderStatus.Cancelled)
        );
    }

    function test_cannotCancelOthersCommitment() public {
        bytes32 commitment = keccak256("test_order_alice");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(commitment);

        vm.prank(bob);
        vm.expectRevert(OrderBook.NotTrader.selector);
        orderBook.cancelCommitment(commitment);
    }

    function test_markSettledOnlyBySettlement() public {
        bytes32 commitment = keccak256("test_order_alice");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(commitment);

        vm.expectRevert(OrderBook.NotSettlementContract.selector);
        orderBook.markSettled(commitment);

        vm.prank(settlement);
        orderBook.markSettled(commitment);
        assertEq(
            uint256(orderBook.statusOf(commitment)),
            uint256(OrderBook.OrderStatus.Settled)
        );
    }

    function test_releaseEscrowOnlyBySettlement() public {
        bytes32 commitment = keccak256("test_order_alice");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(commitment);

        // not settlement
        vm.expectRevert(OrderBook.NotSettlementContract.selector);
        orderBook.releaseEscrow(commitment, payable(bob));

        // settlement, but not yet marked settled -> rejected
        vm.prank(settlement);
        vm.expectRevert(OrderBook.NotSettlementContract.selector);
        orderBook.releaseEscrow(commitment, payable(bob));
    }

    function test_setSettlementOncePattern() public {
        // Deploy with zero settlement (two-step deploy path)
        OrderBook ob = new OrderBook(address(0));
        assertEq(ob.settlement(), address(0));

        ob.setSettlement(settlement);
        assertEq(ob.settlement(), settlement);

        // cannot set twice
        vm.expectRevert(OrderBook.SettlementAlreadySet.selector);
        ob.setSettlement(address(0x1234));
    }

    function test_setSettlementOnlyOwner() public {
        OrderBook ob = new OrderBook(address(0));
        vm.prank(alice);
        vm.expectRevert(OrderBook.NotOwner.selector);
        ob.setSettlement(settlement);
    }

    function test_getOpenCommitments() public {
        bytes32 c1 = keccak256("c1");
        bytes32 c2 = keccak256("c2");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c1);
        vm.prank(bob);
        orderBook.submitCommitment{value: 1 ether}(c2);

        bytes32[] memory open = orderBook.getOpenCommitments();
        assertEq(open.length, 2);

        // cancel one; open list shrinks
        vm.prank(alice);
        orderBook.cancelCommitment(c1);
        open = orderBook.getOpenCommitments();
        assertEq(open.length, 1);
        assertEq(open[0], c2);
    }

    /// @notice Reentrancy: a malicious trader cannot re-enter cancelCommitment
    ///         during its refund to drain more than its escrow.
    function test_reentrancy_cancelIsGuarded() public {
        ReentrantCanceller attacker = new ReentrantCanceller(orderBook);
        vm.deal(address(attacker), 0);
        // fund the attacker's escrow via the contract itself
        bytes32 commitment = keccak256("attacker_order");
        attacker.submit{value: 3 ether}(commitment);

        uint256 bookBalBefore = address(orderBook).balance;
        assertEq(bookBalBefore, 3 ether);

        attacker.attack(commitment);

        // Attacker received exactly its escrow once (no double-withdraw).
        assertEq(address(attacker).balance, 3 ether);
        // The reentrant nested call was blocked by the guard.
        assertTrue(attacker.reentryBlocked());
        // OrderBook fully drained of just that escrow.
        assertEq(address(orderBook).balance, 0);
    }

    // allow this test contract to receive ETH (not used, but safe)
    receive() external payable {}
}

/// @dev Attempts to re-enter cancelCommitment during the refund call.
contract ReentrantCanceller {
    OrderBook public immutable orderBook;
    bytes32 private target;
    bool public reentryBlocked;
    bool private entered;

    constructor(OrderBook _orderBook) {
        orderBook = _orderBook;
    }

    function submit(bytes32 commitment) external payable {
        orderBook.submitCommitment{value: msg.value}(commitment);
    }

    function attack(bytes32 commitment) external {
        target = commitment;
        orderBook.cancelCommitment(commitment);
    }

    receive() external payable {
        if (!entered) {
            entered = true;
            // Attempt re-entry; nonReentrant must make this revert. We catch
            // it so the legitimate (outer) refund still completes, proving the
            // guard fired without breaking normal flow.
            try orderBook.cancelCommitment(target) {
                // should never succeed
            } catch {
                reentryBlocked = true;
            }
        }
    }
}
