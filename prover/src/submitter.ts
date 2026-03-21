import { ethers } from "ethers";
import type { MatchedPair, Groth16Proof } from "./types";
import { proofToSolidityCalldata } from "./calldata";
import addresses from "../../shared/addresses.json";

/** ABI matches DarkPoolSettlement.settle() from Part 11 (array-typed proof). */
const SETTLEMENT_ABI = [
  "function settle(uint256[2] pA, uint256[2][2] pB, uint256[2] pC, bytes32 commitmentA, bytes32 commitmentB, uint256 clearingPrice) external",
] as const;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[submitter] Missing required env var: ${name}`);
  }
  return value;
}

/**
 * Submit a verified proof to DarkPoolSettlement.sol on Sepolia.
 * snarkjs is used as a library for calldata export — no subprocess.
 */
export async function submitSettlement(
  pair: MatchedPair,
  proof: Groth16Proof,
  publicSignals: string[],
) {
  const rpcUrl = requireEnv("SEPOLIA_RPC_URL");
  const privateKey = requireEnv("PROVER_PRIVATE_KEY");

  if (addresses.settlement === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      "[submitter] shared/addresses.json has placeholder addresses — deploy contracts first",
    );
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  const settlement = new ethers.Contract(
    addresses.settlement,
    SETTLEMENT_ABI,
    signer,
  );

  const { pA, pB, pC } = await proofToSolidityCalldata(proof, publicSignals);

  console.log("[submitter] Submitting settlement tx to Sepolia...");

  const tx = await settlement.settle(
    pA,
    pB,
    pC,
    pair.orderA.commitmentHash,
    pair.orderB.commitmentHash,
    pair.clearingPrice,
  );

  const receipt = await tx.wait();
  console.log("[submitter] Settled at block", receipt?.blockNumber);
  console.log("[submitter] Tx hash:", receipt?.hash);

  return receipt;
}
