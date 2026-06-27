// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {OrderBook} from "../src/OrderBook.sol";
import {DarkPoolSettlement} from "../src/DarkPoolSettlement.sol";
import {IVerifier} from "../src/interfaces/IVerifier.sol";
import {Groth16Verifier} from "../src/Verifier.sol";

/// @dev Configurable mock verifier — does not depend on real proof data.
contract MockVerifier is IVerifier {
    bool public result = true;

    function setResult(bool r) external {
        result = r;
    }

    function verifyProof(
        uint[2] calldata,
        uint[2][2] calldata,
        uint[2] calldata,
        uint[3] calldata
    ) external view returns (bool) {
        return result;
    }
}

/// @dev Returns false unless clearingPrice matches the configured expected price.
///      Used to assert that the settlement contract passes the right public signals.
contract PriceGatingVerifier is IVerifier {
    uint256 public expectedPrice;

    constructor(uint256 _expectedPrice) {
        expectedPrice = _expectedPrice;
    }

    function verifyProof(
        uint[2] calldata,
        uint[2][2] calldata,
        uint[2] calldata,
        uint[3] calldata pubSignals
    ) external view returns (bool) {
        return pubSignals[2] == expectedPrice;
    }
}

contract DarkPoolSettlementTest is Test {
    OrderBook public orderBook;
    DarkPoolSettlement public settlement;
    MockVerifier public verifier;

    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    bytes32 constant COMMIT_A = keccak256("orderA");
    bytes32 constant COMMIT_B = keccak256("orderB");
    uint256 constant CLEARING = 3_421_500_000; // $3,421.50 at 6 decimals

    uint[2] zeroA = [uint256(0), 0];
    uint[2][2] zeroB = [[uint256(0), 0], [uint256(0), 0]];
    uint[2] zeroC = [uint256(0), 0];

    event OrdersSettled(
        bytes32 indexed commitmentA,
        bytes32 indexed commitmentB,
        uint256 clearingPrice,
        address traderA,
        address traderB,
        uint256 settledBlock
    );

    function setUp() public {
        verifier = new MockVerifier();
        orderBook = new OrderBook(address(0));
        settlement = new DarkPoolSettlement(address(verifier), address(orderBook));
        orderBook.setSettlement(address(settlement));

        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function _submitBoth(uint256 escrowA, uint256 escrowB) internal {
        vm.prank(alice);
        orderBook.submitCommitment{value: escrowA}(COMMIT_A);
        vm.prank(bob);
        orderBook.submitCommitment{value: escrowB}(COMMIT_B);
    }

    // ─── Happy path ────────────────────────────────────────────────────────────

    function test_settle_happyPath_swapsEscrow() public {
        _submitBoth(2 ether, 3 ether);
        uint256 aliceBefore = alice.balance;
        uint256 bobBefore = bob.balance;

        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        // A's 2 ETH goes to B; B's 3 ETH goes to A.
        assertEq(alice.balance, aliceBefore + 3 ether);
        assertEq(bob.balance, bobBefore + 2 ether);
        assertEq(uint256(orderBook.statusOf(COMMIT_A)), uint256(OrderBook.OrderStatus.Settled));
        assertEq(uint256(orderBook.statusOf(COMMIT_B)), uint256(OrderBook.OrderStatus.Settled));
        assertEq(address(orderBook).balance, 0);
    }

    function test_settle_emitsOrdersSettled() public {
        _submitBoth(1 ether, 1 ether);
        vm.roll(100);

        vm.expectEmit(true, true, false, true, address(settlement));
        emit OrdersSettled(COMMIT_A, COMMIT_B, CLEARING, alice, bob, 100);

        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    function test_settle_zeroEscrow_succeeds() public {
        // 0-escrow commitments are valid (e.g. off-chain agreements).
        _submitBoth(0, 0);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        assertEq(uint256(orderBook.statusOf(COMMIT_A)), uint256(OrderBook.OrderStatus.Settled));
        assertEq(uint256(orderBook.statusOf(COMMIT_B)), uint256(OrderBook.OrderStatus.Settled));
    }

    function test_settle_reverseOrder_treatedAsSamePair() public {
        _submitBoth(1 ether, 2 ether);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        // Swap input order; _pairKey is commutative so PairAlreadySettled fires.
        uint[2] memory altA = [uint256(1), 0]; // different proof bytes
        vm.expectRevert(DarkPoolSettlement.PairAlreadySettled.selector);
        settlement.settle(altA, zeroB, zeroC, COMMIT_B, COMMIT_A, CLEARING);
    }

    function test_settle_multipleIndependentPairs() public {
        bytes32 cC = keccak256("orderC");
        bytes32 cD = keccak256("orderD");
        address carol = address(0xCA201);
        address dave = address(0xDA7E);
        vm.deal(carol, 10 ether);
        vm.deal(dave, 10 ether);

        _submitBoth(1 ether, 1 ether);
        vm.prank(carol);
        orderBook.submitCommitment{value: 2 ether}(cC);
        vm.prank(dave);
        orderBook.submitCommitment{value: 2 ether}(cD);

        // Settle both pairs independently.
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
        uint[2] memory altA = [uint256(2), 0]; // distinct proof hash
        settlement.settle(altA, zeroB, zeroC, cC, cD, CLEARING);

        assertEq(uint256(orderBook.statusOf(COMMIT_A)), uint256(OrderBook.OrderStatus.Settled));
        assertEq(uint256(orderBook.statusOf(COMMIT_B)), uint256(OrderBook.OrderStatus.Settled));
        assertEq(uint256(orderBook.statusOf(cC)), uint256(OrderBook.OrderStatus.Settled));
        assertEq(uint256(orderBook.statusOf(cD)), uint256(OrderBook.OrderStatus.Settled));
    }

    // ─── Proof validation ──────────────────────────────────────────────────────

    function test_settle_badProof_reverts() public {
        _submitBoth(2 ether, 3 ether);
        verifier.setResult(false);

        vm.expectRevert(DarkPoolSettlement.ProofInvalid.selector);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    function test_settle_publicSignals_passedToVerifier() public {
        // PriceGatingVerifier only returns true if pubSignals[2] == CLEARING.
        // If settlement passes the wrong price, this reverts with ProofInvalid.
        PriceGatingVerifier gating = new PriceGatingVerifier(CLEARING);
        OrderBook ob = new OrderBook(address(0));
        DarkPoolSettlement st = new DarkPoolSettlement(address(gating), address(ob));
        ob.setSettlement(address(st));

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.prank(alice);
        ob.submitCommitment{value: 1 ether}(COMMIT_A);
        vm.prank(bob);
        ob.submitCommitment{value: 1 ether}(COMMIT_B);

        // Correct price succeeds.
        st.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        assertEq(uint256(ob.statusOf(COMMIT_A)), uint256(OrderBook.OrderStatus.Settled));
    }

    // ─── Replay protection ─────────────────────────────────────────────────────

    function test_settle_doubleSettle_sameProof_reverts() public {
        _submitBoth(2 ether, 3 ether);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        vm.expectRevert(DarkPoolSettlement.ProofAlreadyUsed.selector);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    function test_settle_samePairDifferentProof_reverts() public {
        _submitBoth(2 ether, 3 ether);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        // Different proof bytes bypass ProofAlreadyUsed but hit PairAlreadySettled.
        uint[2] memory altA = [uint256(1), 2];
        vm.expectRevert(DarkPoolSettlement.PairAlreadySettled.selector);
        settlement.settle(altA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    // ─── Guard conditions ──────────────────────────────────────────────────────

    function test_settle_identicalCommitments_reverts() public {
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(COMMIT_A);

        vm.expectRevert(DarkPoolSettlement.IdenticalCommitments.selector);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_A, CLEARING);
    }

    function test_settle_commitmentANotFound_reverts() public {
        // Only B exists.
        vm.prank(bob);
        orderBook.submitCommitment{value: 1 ether}(COMMIT_B);

        vm.expectRevert(DarkPoolSettlement.CommitmentANotFound.selector);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    function test_settle_commitmentBNotFound_reverts() public {
        // Only A exists.
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(COMMIT_A);

        vm.expectRevert(DarkPoolSettlement.CommitmentBNotFound.selector);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    function test_settle_neitherCommitmentExists_reverts() public {
        vm.expectRevert(DarkPoolSettlement.CommitmentANotFound.selector);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    // ─── Reentrancy ────────────────────────────────────────────────────────────

    function test_reentrancy_settleIsGuarded() public {
        ReentrantTrader attacker = new ReentrantTrader(settlement);

        vm.prank(alice);
        orderBook.submitCommitment{value: 2 ether}(COMMIT_A);
        vm.deal(address(attacker), 3 ether);
        attacker.submit{value: 3 ether}(COMMIT_B);

        attacker.arm(COMMIT_A, COMMIT_B, CLEARING);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        assertTrue(attacker.reentryBlocked());
        assertEq(uint256(orderBook.statusOf(COMMIT_A)), uint256(OrderBook.OrderStatus.Settled));
        assertEq(uint256(orderBook.statusOf(COMMIT_B)), uint256(OrderBook.OrderStatus.Settled));
    }

    // ─── Immutable wiring ──────────────────────────────────────────────────────

    function test_immutables_wiredCorrectly() public view {
        assertEq(address(settlement.verifier()), address(verifier));
        assertEq(address(settlement.orderBook()), address(orderBook));
        assertEq(settlement.owner(), address(this));
    }

    // ─── Fuzz ──────────────────────────────────────────────────────────────────

    /// @dev Any two distinct commitments can be settled and escrow swaps correctly.
    function testFuzz_settle_escrowSwap(
        bytes32 saltA,
        bytes32 saltB,
        uint96 escrowA,
        uint96 escrowB
    ) public {
        vm.assume(saltA != saltB);
        bytes32 cA = keccak256(abi.encode(saltA));
        bytes32 cB = keccak256(abi.encode(saltB));
        vm.assume(cA != cB);

        vm.deal(alice, escrowA);
        vm.deal(bob, escrowB);

        vm.prank(alice);
        orderBook.submitCommitment{value: escrowA}(cA);
        vm.prank(bob);
        orderBook.submitCommitment{value: escrowB}(cB);

        uint256 aliceBefore = alice.balance;
        uint256 bobBefore = bob.balance;

        settlement.settle(zeroA, zeroB, zeroC, cA, cB, CLEARING);

        assertEq(alice.balance, aliceBefore + escrowB);
        assertEq(bob.balance, bobBefore + escrowA);
        assertEq(address(orderBook).balance, 0);
    }

    /// @dev Clearing price is forwarded verbatim: any price other than the
    ///      expected one makes the gating verifier reject.
    function testFuzz_clearingPrice_passedToVerifier(uint256 price) public {
        PriceGatingVerifier gating = new PriceGatingVerifier(price);
        OrderBook ob = new OrderBook(address(0));
        DarkPoolSettlement st = new DarkPoolSettlement(address(gating), address(ob));
        ob.setSettlement(address(st));

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.prank(alice);
        ob.submitCommitment{value: 1 ether}(COMMIT_A);
        vm.prank(bob);
        ob.submitCommitment{value: 1 ether}(COMMIT_B);

        // Gating verifier passes only when price matches — proves forwarding.
        st.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, price);
        assertEq(uint256(ob.statusOf(COMMIT_A)), uint256(OrderBook.OrderStatus.Settled));
    }

    // ─── Real Groth16 proof ────────────────────────────────────────────────────

    function test_realProof_verifiesAndSettles() public {
        Groth16Verifier realVerifier = new Groth16Verifier();
        OrderBook ob = new OrderBook(address(0));
        DarkPoolSettlement st = new DarkPoolSettlement(address(realVerifier), address(ob));
        ob.setSettlement(address(st));

        bytes32 cA = bytes32(uint256(0x2ad7ac4eb6e0c45cd5c8fe80538509d7316378c6bdb1ad722cf27079f3f60983));
        bytes32 cB = bytes32(uint256(0x2a6a3d6361c2e704474d31ddb2aeb30a3fe799dbfc9cacf5270ba2aeb8ab975b));
        uint256 clearing = 0xcbeff260; // 3,421,500,000

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.prank(alice);
        ob.submitCommitment{value: 1 ether}(cA);
        vm.prank(bob);
        ob.submitCommitment{value: 1 ether}(cB);

        uint[2] memory pA = [
            uint256(0x26cbf8496039afefcdd6c68b2f375c4db0ad830a01b3b46ea6f3631e72f5fe5c),
            uint256(0x19b15fa375e34d2b745415832fe4ff161f52c52e18b3b686bec5816ff98bd75c)
        ];
        uint[2][2] memory pB = [
            [
                uint256(0x2c887a53dd671e0931e608c43d2aac9e7f3b6190db89b1433cadd4cb8fb46ef2),
                uint256(0x0e949aee3a56b4df22a2572eee52eef04f667bddaa55c660ed30c6471cb13d4d)
            ],
            [
                uint256(0x09fb8ba45091dd28860645083fda118de174ec0488c5a7cdea3e5661f9c24633),
                uint256(0x035b56c4016022b57f9a8f96796355156e115106baed3a203a44d9d9eb3bb752)
            ]
        ];
        uint[2] memory pC = [
            uint256(0x217b3ae20a871288d70c4a388c287e1ee555e12103c6ec6fa840430407bb207c),
            uint256(0x250d25fc9955073a2ae9f777515957d4649fbd64248d7ff48e7fe661e413143b)
        ];

        uint256 aliceBefore = alice.balance;
        uint256 bobBefore = bob.balance;

        st.settle(pA, pB, pC, cA, cB, clearing);

        assertEq(alice.balance, aliceBefore + 1 ether);
        assertEq(bob.balance, bobBefore + 1 ether);
        assertEq(uint256(ob.statusOf(cA)), uint256(OrderBook.OrderStatus.Settled));
        assertEq(uint256(ob.statusOf(cB)), uint256(OrderBook.OrderStatus.Settled));
    }

    function test_realProof_wrongPublicInput_reverts() public {
        Groth16Verifier realVerifier = new Groth16Verifier();
        OrderBook ob = new OrderBook(address(0));
        DarkPoolSettlement st = new DarkPoolSettlement(address(realVerifier), address(ob));
        ob.setSettlement(address(st));

        bytes32 cA = bytes32(uint256(0x2ad7ac4eb6e0c45cd5c8fe80538509d7316378c6bdb1ad722cf27079f3f60983));
        bytes32 cB = bytes32(uint256(0x2a6a3d6361c2e704474d31ddb2aeb30a3fe799dbfc9cacf5270ba2aeb8ab975b));

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.prank(alice);
        ob.submitCommitment{value: 1 ether}(cA);
        vm.prank(bob);
        ob.submitCommitment{value: 1 ether}(cB);

        uint[2] memory pA = [
            uint256(0x26cbf8496039afefcdd6c68b2f375c4db0ad830a01b3b46ea6f3631e72f5fe5c),
            uint256(0x19b15fa375e34d2b745415832fe4ff161f52c52e18b3b686bec5816ff98bd75c)
        ];
        uint[2][2] memory pB = [
            [
                uint256(0x2c887a53dd671e0931e608c43d2aac9e7f3b6190db89b1433cadd4cb8fb46ef2),
                uint256(0x0e949aee3a56b4df22a2572eee52eef04f667bddaa55c660ed30c6471cb13d4d)
            ],
            [
                uint256(0x09fb8ba45091dd28860645083fda118de174ec0488c5a7cdea3e5661f9c24633),
                uint256(0x035b56c4016022b57f9a8f96796355156e115106baed3a203a44d9d9eb3bb752)
            ]
        ];
        uint[2] memory pC = [
            uint256(0x217b3ae20a871288d70c4a388c287e1ee555e12103c6ec6fa840430407bb207c),
            uint256(0x250d25fc9955073a2ae9f777515957d4649fbd64248d7ff48e7fe661e413143b)
        ];

        // Tampered clearing price — proof must not verify.
        vm.expectRevert(DarkPoolSettlement.ProofInvalid.selector);
        st.settle(pA, pB, pC, cA, cB, 9_999_999_999);
    }

    function test_realProof_tamperedCommitment_reverts() public {
        Groth16Verifier realVerifier = new Groth16Verifier();
        OrderBook ob = new OrderBook(address(0));
        DarkPoolSettlement st = new DarkPoolSettlement(address(realVerifier), address(ob));
        ob.setSettlement(address(st));

        bytes32 cA = bytes32(uint256(0x2ad7ac4eb6e0c45cd5c8fe80538509d7316378c6bdb1ad722cf27079f3f60983));
        bytes32 cB = bytes32(uint256(0x2a6a3d6361c2e704474d31ddb2aeb30a3fe799dbfc9cacf5270ba2aeb8ab975b));
        bytes32 fakeCB = keccak256("tampered");
        uint256 clearing = 0xcbeff260;

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.prank(alice);
        ob.submitCommitment{value: 1 ether}(cA);
        vm.prank(bob);
        ob.submitCommitment{value: 1 ether}(cB);
        // Submit fakeCB so the commitment is found but the proof won't verify.
        vm.prank(bob);
        ob.submitCommitment{value: 1 ether}(fakeCB);

        uint[2] memory pA = [
            uint256(0x26cbf8496039afefcdd6c68b2f375c4db0ad830a01b3b46ea6f3631e72f5fe5c),
            uint256(0x19b15fa375e34d2b745415832fe4ff161f52c52e18b3b686bec5816ff98bd75c)
        ];
        uint[2][2] memory pB = [
            [
                uint256(0x2c887a53dd671e0931e608c43d2aac9e7f3b6190db89b1433cadd4cb8fb46ef2),
                uint256(0x0e949aee3a56b4df22a2572eee52eef04f667bddaa55c660ed30c6471cb13d4d)
            ],
            [
                uint256(0x09fb8ba45091dd28860645083fda118de174ec0488c5a7cdea3e5661f9c24633),
                uint256(0x035b56c4016022b57f9a8f96796355156e115106baed3a203a44d9d9eb3bb752)
            ]
        ];
        uint[2] memory pC = [
            uint256(0x217b3ae20a871288d70c4a388c287e1ee555e12103c6ec6fa840430407bb207c),
            uint256(0x250d25fc9955073a2ae9f777515957d4649fbd64248d7ff48e7fe661e413143b)
        ];

        // Commitment B swapped for a fake hash — proof public signals mismatch.
        vm.expectRevert(DarkPoolSettlement.ProofInvalid.selector);
        st.settle(pA, pB, pC, cA, fakeCB, clearing);
    }
}

contract ReentrantTrader {
    DarkPoolSettlement public immutable settlement;
    OrderBook public immutable orderBook;
    bool public reentryBlocked;
    bool private entered;

    bytes32 private cA;
    bytes32 private cB;
    uint256 private clearing;

    uint[2] private z2;
    uint[2][2] private z22;

    constructor(DarkPoolSettlement _settlement) {
        settlement = _settlement;
        orderBook = OrderBook(address(_settlement.orderBook()));
    }

    function submit(bytes32 commitment) external payable {
        orderBook.submitCommitment{value: msg.value}(commitment);
    }

    function arm(bytes32 _cA, bytes32 _cB, uint256 _clearing) external {
        cA = _cA;
        cB = _cB;
        clearing = _clearing;
    }

    receive() external payable {
        if (!entered) {
            entered = true;
            try settlement.settle(z2, z22, z2, cA, cB, clearing) {} catch {
                reentryBlocked = true;
            }
        }
    }
}
