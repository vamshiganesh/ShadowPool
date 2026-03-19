// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {OrderBook} from "../src/OrderBook.sol";
import {DarkPoolSettlement} from "../src/DarkPoolSettlement.sol";
import {IVerifier} from "../src/interfaces/IVerifier.sol";
import {Groth16Verifier} from "../src/Verifier.sol";

/// @dev Verifier stub whose result is configurable, for settlement-logic tests
///      that don't depend on a specific proof.
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

contract DarkPoolSettlementTest is Test {
    OrderBook public orderBook;
    DarkPoolSettlement public settlement;
    MockVerifier public verifier;

    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    bytes32 constant COMMIT_A = keccak256("orderA");
    bytes32 constant COMMIT_B = keccak256("orderB");
    uint256 constant CLEARING = 3_421_500_000;

    // dummy proof (ignored by MockVerifier)
    uint[2] zeroA = [uint256(0), 0];
    uint[2][2] zeroB = [[uint256(0), 0], [uint256(0), 0]];
    uint[2] zeroC = [uint256(0), 0];

    function setUp() public {
        verifier = new MockVerifier();
        orderBook = new OrderBook(address(0));
        settlement =
            new DarkPoolSettlement(address(verifier), address(orderBook));
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

    function test_settle_happyPath_swapsEscrow() public {
        _submitBoth(2 ether, 3 ether);

        uint256 aliceBefore = alice.balance;
        uint256 bobBefore = bob.balance;

        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        // A's escrow (2) -> B ; B's escrow (3) -> A
        assertEq(alice.balance, aliceBefore + 3 ether);
        assertEq(bob.balance, bobBefore + 2 ether);
        assertEq(
            uint256(orderBook.statusOf(COMMIT_A)),
            uint256(OrderBook.OrderStatus.Settled)
        );
        assertEq(
            uint256(orderBook.statusOf(COMMIT_B)),
            uint256(OrderBook.OrderStatus.Settled)
        );
        assertEq(address(orderBook).balance, 0);
    }

    function test_settle_badProof_reverts() public {
        _submitBoth(2 ether, 3 ether);
        verifier.setResult(false);

        vm.expectRevert(DarkPoolSettlement.ProofInvalid.selector);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    function test_settle_doubleSettle_reverts() public {
        _submitBoth(2 ether, 3 ether);

        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        // Same proof bytes -> caught by usedProofs first.
        vm.expectRevert(DarkPoolSettlement.ProofAlreadyUsed.selector);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    function test_settle_samePairDifferentProof_reverts() public {
        _submitBoth(2 ether, 3 ether);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        // Different proof bytes, same pair -> caught by settledPairs.
        uint[2] memory altA = [uint256(1), 2];
        vm.expectRevert(DarkPoolSettlement.PairAlreadySettled.selector);
        settlement.settle(altA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    function test_settle_unknownCommitment_reverts() public {
        // Only A submitted.
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(COMMIT_A);

        vm.expectRevert(DarkPoolSettlement.CommitmentBNotFound.selector);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);
    }

    function test_settle_identicalCommitments_reverts() public {
        vm.prank(alice);
        orderBook.submitCommitment{value: 1 ether}(COMMIT_A);

        vm.expectRevert(DarkPoolSettlement.IdenticalCommitments.selector);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_A, CLEARING);
    }

    /// @notice Reentrancy: a malicious counterparty receiving escrow cannot
    ///         re-enter settle().
    function test_reentrancy_settleIsGuarded() public {
        ReentrantTrader attacker = new ReentrantTrader(settlement);

        vm.prank(alice);
        orderBook.submitCommitment{value: 2 ether}(COMMIT_A);
        // attacker is trader B; A's escrow (2 ETH) will be sent to attacker
        vm.deal(address(attacker), 3 ether);
        attacker.submit{value: 3 ether}(COMMIT_B);

        attacker.arm(COMMIT_A, COMMIT_B, CLEARING);
        settlement.settle(zeroA, zeroB, zeroC, COMMIT_A, COMMIT_B, CLEARING);

        // The reentrant settle() attempt was blocked by the guard.
        assertTrue(attacker.reentryBlocked());
        // Settlement still completed exactly once.
        assertEq(
            uint256(orderBook.statusOf(COMMIT_A)),
            uint256(OrderBook.OrderStatus.Settled)
        );
    }

    /// @notice End-to-end with the REAL snarkjs-generated verifier and a real
    ///         Groth16 proof (from circuits/test/{proof,public}.json).
    function test_realProof_verifiesAndSettles() public {
        Groth16Verifier realVerifier = new Groth16Verifier();
        OrderBook ob = new OrderBook(address(0));
        DarkPoolSettlement st =
            new DarkPoolSettlement(address(realVerifier), address(ob));
        ob.setSettlement(address(st));

        // Public signals from circuits/test/public.json (field elements).
        bytes32 cA =
            bytes32(uint256(0x2ad7ac4eb6e0c45cd5c8fe80538509d7316378c6bdb1ad722cf27079f3f60983));
        bytes32 cB =
            bytes32(uint256(0x2a6a3d6361c2e704474d31ddb2aeb30a3fe799dbfc9cacf5270ba2aeb8ab975b));
        uint256 clearing = 0xcbeff260; // 3,421,500,000

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.prank(alice);
        ob.submitCommitment{value: 1 ether}(cA);
        vm.prank(bob);
        ob.submitCommitment{value: 1 ether}(cB);

        // Proof calldata from `snarkjs zkey export soliditycalldata`.
        uint[2] memory pA = [
            uint256(0x017d18c0654019b3151bf119628004b2fcebf4cb895d9fe971e6aacf964f10e4),
            uint256(0x1ef406ce7df929668c262a92addc0544a08c7d36229b87d4140f778c07a2801f)
        ];
        uint[2][2] memory pB = [
            [
                uint256(0x0839afdb9cf08dc705c913fbea62f4e25e870442c09916681268de05628be2db),
                uint256(0x25f380a910cacd02444e6b0141879b4d053c35bdfed0172ed6cb88cb283a7a71)
            ],
            [
                uint256(0x0e525aad4fb32a96ebc30541ec7083c64146c1ed3cc1c10a8bb6e43c7277411d),
                uint256(0x272c82187cf4959b14c3aa1e7b17b582d2acc8645595df1fd433b27b084be2a7)
            ]
        ];
        uint[2] memory pC = [
            uint256(0x25bcb637e252009c898f27378f3ba6134d0943ed6486b9c5141f6570fa5ec327),
            uint256(0x255d25ca1fe899493ea164fae21e817219edb75afd74bcccadef7a85c268c32a)
        ];

        uint256 aliceBefore = alice.balance;
        uint256 bobBefore = bob.balance;

        st.settle(pA, pB, pC, cA, cB, clearing);

        // Each side's 1 ETH escrow goes to the counterparty.
        assertEq(alice.balance, aliceBefore + 1 ether);
        assertEq(bob.balance, bobBefore + 1 ether);
        assertEq(
            uint256(ob.statusOf(cA)), uint256(OrderBook.OrderStatus.Settled)
        );
        assertEq(
            uint256(ob.statusOf(cB)), uint256(OrderBook.OrderStatus.Settled)
        );
    }

    /// @notice A tampered public input (wrong clearing price) must fail the real
    ///         verifier.
    function test_realProof_wrongPublicInput_reverts() public {
        Groth16Verifier realVerifier = new Groth16Verifier();
        OrderBook ob = new OrderBook(address(0));
        DarkPoolSettlement st =
            new DarkPoolSettlement(address(realVerifier), address(ob));
        ob.setSettlement(address(st));

        bytes32 cA =
            bytes32(uint256(0x2ad7ac4eb6e0c45cd5c8fe80538509d7316378c6bdb1ad722cf27079f3f60983));
        bytes32 cB =
            bytes32(uint256(0x2a6a3d6361c2e704474d31ddb2aeb30a3fe799dbfc9cacf5270ba2aeb8ab975b));

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.prank(alice);
        ob.submitCommitment{value: 1 ether}(cA);
        vm.prank(bob);
        ob.submitCommitment{value: 1 ether}(cB);

        uint[2] memory pA = [
            uint256(0x017d18c0654019b3151bf119628004b2fcebf4cb895d9fe971e6aacf964f10e4),
            uint256(0x1ef406ce7df929668c262a92addc0544a08c7d36229b87d4140f778c07a2801f)
        ];
        uint[2][2] memory pB = [
            [
                uint256(0x0839afdb9cf08dc705c913fbea62f4e25e870442c09916681268de05628be2db),
                uint256(0x25f380a910cacd02444e6b0141879b4d053c35bdfed0172ed6cb88cb283a7a71)
            ],
            [
                uint256(0x0e525aad4fb32a96ebc30541ec7083c64146c1ed3cc1c10a8bb6e43c7277411d),
                uint256(0x272c82187cf4959b14c3aa1e7b17b582d2acc8645595df1fd433b27b084be2a7)
            ]
        ];
        uint[2] memory pC = [
            uint256(0x25bcb637e252009c898f27378f3ba6134d0943ed6486b9c5141f6570fa5ec327),
            uint256(0x255d25ca1fe899493ea164fae21e817219edb75afd74bcccadef7a85c268c32a)
        ];

        // Wrong clearing price -> proof must not verify.
        vm.expectRevert(DarkPoolSettlement.ProofInvalid.selector);
        st.settle(pA, pB, pC, cA, cB, 9_999_999_999);
    }
}

/// @dev Malicious trader B that attempts to re-enter settle() when it receives
///      escrow. The reentrant attempt is caught so the legitimate settlement
///      completes, proving the guard fired.
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
            try settlement.settle(z2, z22, z2, cA, cB, clearing) {
                // should never succeed
            } catch {
                reentryBlocked = true;
            }
        }
    }
}
