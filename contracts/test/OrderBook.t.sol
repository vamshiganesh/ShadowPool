// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {OrderBook} from "../src/OrderBook.sol";

contract OrderBookTest is Test {
    OrderBook public orderBook;
    address public settlement = address(0xBEEF);
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);
    address public carol = address(0xCA201);

    event CommitmentSubmitted(
        bytes32 indexed commitment, address indexed trader, uint256 blockNumber
    );
    event CommitmentSettled(bytes32 indexed commitment, address indexed trader);
    event CommitmentCancelled(bytes32 indexed commitment, address indexed trader);
    event EscrowReleased(
        bytes32 indexed commitment, address indexed recipient, uint256 amount
    );
    event SettlementSet(address indexed settlement);

    function setUp() public {
        orderBook = new OrderBook(settlement);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
    }

    // ─── Submit ────────────────────────────────────────────────────────────────

    function test_submitCommitment() public {
        bytes32 c = keccak256("alice_order");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        (address trader, uint256 amount) = orderBook.getEscrow(c);
        assertEq(trader, alice);
        assertEq(amount, 1 ether);
        assertEq(uint256(orderBook.statusOf(c)), uint256(OrderBook.OrderStatus.OnChain));
    }

    function test_submitCommitment_zeroEscrow() public {
        bytes32 c = keccak256("free_order");
        vm.prank(alice);
        orderBook.submitCommitment{value: 0}(c);

        (address trader, uint256 amount) = orderBook.getEscrow(c);
        assertEq(trader, alice);
        assertEq(amount, 0);
    }

    function test_submitCommitment_emitsEvent() public {
        bytes32 c = keccak256("event_order");
        vm.roll(42);

        vm.expectEmit(true, true, false, true, address(orderBook));
        emit CommitmentSubmitted(c, alice, 42);

        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);
    }

    function test_submitCommitment_storesBlock() public {
        bytes32 c = keccak256("block_order");
        vm.roll(999);
        vm.prank(alice);
        orderBook.submitCommitment{value: 0.5 ether}(c);

        // Access the full CommitmentRecord via the public mapping.
        (,, address escrowToken, uint256 submittedBlock,) = orderBook.commitments(c);
        assertEq(submittedBlock, 999);
        assertEq(escrowToken, address(0)); // native ETH
    }

    function test_cannotSubmitDuplicate() public {
        bytes32 c = keccak256("dup_order");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        vm.prank(bob);
        vm.expectRevert(OrderBook.CommitmentAlreadyExists.selector);
        orderBook.submitCommitment{value: 1 ether}(c);
    }

    function test_commitmentCount_incrementsOnSubmit() public {
        assertEq(orderBook.commitmentCount(), 0);

        bytes32 c1 = keccak256("c1");
        bytes32 c2 = keccak256("c2");

        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c1);
        assertEq(orderBook.commitmentCount(), 1);

        vm.prank(bob);
        orderBook.submitCommitment{value: 1 ether}(c2);
        assertEq(orderBook.commitmentCount(), 2);
    }

    function test_contractReceivesEscrow() public {
        bytes32 c = keccak256("escrow_check");
        vm.prank(alice);
        orderBook.submitCommitment{value: 5 ether}(c);

        assertEq(address(orderBook).balance, 5 ether);
    }

    // ─── Cancel ────────────────────────────────────────────────────────────────

    function test_cancelCommitment_refundsExactEscrow() public {
        bytes32 c = keccak256("refund_order");
        vm.prank(alice);
        orderBook.submitCommitment{value: 2 ether}(c);

        uint256 before = alice.balance;
        vm.prank(alice);
        orderBook.cancelCommitment(c);

        assertEq(alice.balance, before + 2 ether);
        assertEq(uint256(orderBook.statusOf(c)), uint256(OrderBook.OrderStatus.Cancelled));
    }

    function test_cancelCommitment_emitsEvent() public {
        bytes32 c = keccak256("cancel_event");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        vm.expectEmit(true, true, false, false, address(orderBook));
        emit CommitmentCancelled(c, alice);

        vm.prank(alice);
        orderBook.cancelCommitment(c);
    }

    function test_cancelCommitment_zeroesEscrow() public {
        bytes32 c = keccak256("zero_after_cancel");
        vm.prank(alice);
        orderBook.submitCommitment{value: 3 ether}(c);

        vm.prank(alice);
        orderBook.cancelCommitment(c);

        (, uint256 amount) = orderBook.getEscrow(c);
        assertEq(amount, 0);
        assertEq(address(orderBook).balance, 0);
    }

    function test_cannotCancelOthersCommitment() public {
        bytes32 c = keccak256("others_order");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        vm.prank(bob);
        vm.expectRevert(OrderBook.NotTrader.selector);
        orderBook.cancelCommitment(c);
    }

    function test_cannotCancelAlreadyCancelled() public {
        bytes32 c = keccak256("double_cancel");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        vm.prank(alice);
        orderBook.cancelCommitment(c);

        vm.prank(alice);
        vm.expectRevert(OrderBook.NotCancellable.selector);
        orderBook.cancelCommitment(c);
    }

    function test_cannotCancelSettledCommitment() public {
        bytes32 c = keccak256("settled_no_cancel");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        vm.prank(settlement);
        orderBook.markSettled(c);

        vm.prank(alice);
        vm.expectRevert(OrderBook.AlreadySettled.selector);
        orderBook.cancelCommitment(c);
    }

    function test_cancelNonExistentCommitment_reverts() public {
        bytes32 c = keccak256("ghost_order");
        vm.prank(alice);
        vm.expectRevert(OrderBook.NotTrader.selector);
        orderBook.cancelCommitment(c);
    }

    // ─── Settlement-only operations ────────────────────────────────────────────

    function test_markSettledOnlyBySettlement() public {
        bytes32 c = keccak256("settle_auth");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        vm.expectRevert(OrderBook.NotSettlementContract.selector);
        orderBook.markSettled(c);

        vm.prank(settlement);
        orderBook.markSettled(c);
        assertEq(uint256(orderBook.statusOf(c)), uint256(OrderBook.OrderStatus.Settled));
    }

    function test_markSettled_emitsEvent() public {
        bytes32 c = keccak256("settled_event");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        vm.expectEmit(true, true, false, false, address(orderBook));
        emit CommitmentSettled(c, alice);

        vm.prank(settlement);
        orderBook.markSettled(c);
    }

    function test_markSettled_unknownCommitment_reverts() public {
        bytes32 c = keccak256("unknown");
        vm.prank(settlement);
        vm.expectRevert(OrderBook.CommitmentNotFound.selector);
        orderBook.markSettled(c);
    }

    function test_markSettled_alreadySettled_reverts() public {
        bytes32 c = keccak256("double_settle");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        vm.prank(settlement);
        orderBook.markSettled(c);

        vm.prank(settlement);
        vm.expectRevert(OrderBook.AlreadySettled.selector);
        orderBook.markSettled(c);
    }

    function test_releaseEscrowOnlyBySettlement() public {
        bytes32 c = keccak256("release_auth");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        vm.expectRevert(OrderBook.NotSettlementContract.selector);
        orderBook.releaseEscrow(c, payable(bob));

        // settlement address, but not yet marked settled -> also rejected
        vm.prank(settlement);
        vm.expectRevert(OrderBook.NotSettlementContract.selector);
        orderBook.releaseEscrow(c, payable(bob));
    }

    function test_releaseEscrow_fullFlow() public {
        bytes32 c = keccak256("full_release");
        vm.prank(alice);
        orderBook.submitCommitment{value: 4 ether}(c);

        vm.prank(settlement);
        orderBook.markSettled(c);

        uint256 bobBefore = bob.balance;
        vm.prank(settlement);
        uint256 released = orderBook.releaseEscrow(c, payable(bob));

        assertEq(released, 4 ether);
        assertEq(bob.balance, bobBefore + 4 ether);
        assertEq(address(orderBook).balance, 0);

        // second release returns 0 (already zeroed)
        vm.prank(settlement);
        uint256 secondRelease = orderBook.releaseEscrow(c, payable(bob));
        assertEq(secondRelease, 0);
    }

    function test_releaseEscrow_emitsEvent() public {
        bytes32 c = keccak256("release_event");
        vm.prank(alice);
        orderBook.submitCommitment{value: 2 ether}(c);

        vm.prank(settlement);
        orderBook.markSettled(c);

        vm.expectEmit(true, true, false, true, address(orderBook));
        emit EscrowReleased(c, bob, 2 ether);

        vm.prank(settlement);
        orderBook.releaseEscrow(c, payable(bob));
    }

    function test_releaseEscrow_zeroRecipient_reverts() public {
        bytes32 c = keccak256("zero_recipient");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c);

        vm.prank(settlement);
        orderBook.markSettled(c);

        vm.prank(settlement);
        vm.expectRevert(OrderBook.ZeroAddress.selector);
        orderBook.releaseEscrow(c, payable(address(0)));
    }

    // ─── Admin ─────────────────────────────────────────────────────────────────

    function test_setSettlementOncePattern() public {
        OrderBook ob = new OrderBook(address(0));
        assertEq(ob.settlement(), address(0));

        ob.setSettlement(settlement);
        assertEq(ob.settlement(), settlement);

        vm.expectRevert(OrderBook.SettlementAlreadySet.selector);
        ob.setSettlement(address(0x1234));
    }

    function test_setSettlementOnlyOwner() public {
        OrderBook ob = new OrderBook(address(0));
        vm.prank(alice);
        vm.expectRevert(OrderBook.NotOwner.selector);
        ob.setSettlement(settlement);
    }

    function test_setSettlement_zeroAddress_reverts() public {
        OrderBook ob = new OrderBook(address(0));
        vm.expectRevert(OrderBook.ZeroAddress.selector);
        ob.setSettlement(address(0));
    }

    function test_setSettlement_emitsEvent() public {
        OrderBook ob = new OrderBook(address(0));
        vm.expectEmit(true, false, false, false, address(ob));
        emit SettlementSet(settlement);
        ob.setSettlement(settlement);
    }

    function test_constructorWithSettlement_setsImmediately() public {
        OrderBook ob = new OrderBook(settlement);
        assertEq(ob.settlement(), settlement);

        // Cannot set again.
        vm.expectRevert(OrderBook.SettlementAlreadySet.selector);
        ob.setSettlement(address(0x9999));
    }

    // ─── Views ─────────────────────────────────────────────────────────────────

    function test_getOpenCommitments() public {
        bytes32 c1 = keccak256("c1");
        bytes32 c2 = keccak256("c2");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c1);
        vm.prank(bob);
        orderBook.submitCommitment{value: 1 ether}(c2);

        bytes32[] memory open = orderBook.getOpenCommitments();
        assertEq(open.length, 2);

        vm.prank(alice);
        orderBook.cancelCommitment(c1);
        open = orderBook.getOpenCommitments();
        assertEq(open.length, 1);
        assertEq(open[0], c2);
    }

    function test_getOpenCommitmentsExcludesSettled() public {
        bytes32 c1 = keccak256("settled_open_check");
        bytes32 c2 = keccak256("still_open");
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(c1);
        vm.prank(bob);
        orderBook.submitCommitment{value: 1 ether}(c2);

        vm.prank(settlement);
        orderBook.markSettled(c1);

        bytes32[] memory open = orderBook.getOpenCommitments();
        assertEq(open.length, 1);
        assertEq(open[0], c2);
    }

    function test_getOpenCommitments_emptyWhenNone() public view {
        bytes32[] memory open = orderBook.getOpenCommitments();
        assertEq(open.length, 0);
    }

    function test_statusOf_nonExistentIsNone() public view {
        bytes32 c = keccak256("ghost");
        assertEq(uint256(orderBook.statusOf(c)), uint256(OrderBook.OrderStatus.None));
    }

    // ─── Fuzz ──────────────────────────────────────────────────────────────────

    /// @dev Any bytes32 hash can be submitted and retrieved correctly.
    function testFuzz_submitAndRetrieve(bytes32 salt, uint96 escrow) public {
        vm.assume(salt != bytes32(0));
        bytes32 c = keccak256(abi.encode(salt));
        uint256 e = uint256(escrow);
        vm.deal(alice, e);

        vm.prank(alice);
        orderBook.submitCommitment{value: e}(c);

        (address trader, uint256 amount) = orderBook.getEscrow(c);
        assertEq(trader, alice);
        assertEq(amount, e);
    }

    /// @dev Any trader gets exactly their escrow back on cancel.
    function testFuzz_cancelRefunds(uint96 escrow) public {
        vm.assume(escrow > 0);
        uint256 e = uint256(escrow);
        vm.deal(alice, e);
        bytes32 c = keccak256("fuzz_cancel");

        vm.prank(alice);
        orderBook.submitCommitment{value: e}(c);

        uint256 before = alice.balance;
        vm.prank(alice);
        orderBook.cancelCommitment(c);

        assertEq(alice.balance, before + e);
        assertEq(address(orderBook).balance, 0);
    }

    /// @dev Many independent commitments can coexist.
    function testFuzz_multipleCommitmentsCoexist(uint8 n) public {
        vm.assume(n > 0 && n <= 20);
        for (uint256 i = 0; i < n; i++) {
            bytes32 c = keccak256(abi.encode("multi", i));
            address trader = address(uint160(0x1000 + i));
            vm.deal(trader, 1 ether);
            vm.prank(trader);
            orderBook.submitCommitment{value: 1 ether}(c);
        }
        assertEq(orderBook.commitmentCount(), n);
        assertEq(orderBook.getOpenCommitments().length, n);
    }

    // ─── Reentrancy ────────────────────────────────────────────────────────────

    function test_reentrancy_cancelIsGuarded() public {
        ReentrantCanceller attacker = new ReentrantCanceller(orderBook);
        bytes32 c = keccak256("attacker_order");
        attacker.submit{value: 3 ether}(c);

        uint256 bookBefore = address(orderBook).balance;
        assertEq(bookBefore, 3 ether);

        attacker.attack(c);

        assertEq(address(attacker).balance, 3 ether);
        assertTrue(attacker.reentryBlocked());
        assertEq(address(orderBook).balance, 0);
    }

    receive() external payable {}
}

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
            try orderBook.cancelCommitment(target) {} catch {
                reentryBlocked = true;
            }
        }
    }
}
