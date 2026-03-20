export interface OrderCommitment {
  /** bytes32 hex string (on-chain Poseidon commitment) */
  commitmentHash: string;
  assetAmount: bigint;
  limitPrice: bigint;
  nonce: bigint;
  salt: bigint;
  /** wallet address — bound via OrderBook escrow, NOT a circuit input */
  trader: string;
  escrowAmount: bigint;
  submittedBlock: number;
}

export interface MatchedPair {
  orderA: OrderCommitment; // maker (bid) — lower limitPrice floor
  orderB: OrderCommitment; // taker (ask) — higher limitPrice ceiling
  clearingPrice: bigint;
}

/** snarkjs Groth16 proof object (pi_a / pi_b / pi_c). */
export interface Groth16Proof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol?: string;
  curve?: string;
}

export interface ProofPackage {
  proof: Groth16Proof;
  publicSignals: string[];
  commitmentA: string;
  commitmentB: string;
  clearingPrice: bigint;
}

/** Parsed Solidity calldata for DarkPoolSettlement.settle(). */
export interface SettlementCalldata {
  pA: [bigint, bigint];
  pB: [[bigint, bigint], [bigint, bigint]];
  pC: [bigint, bigint];
  publicSignals: [bigint, bigint, bigint];
}

export type QueueMessageType = "new_commitment" | "match_ready";

export interface QueueMessage {
  type: QueueMessageType;
  payload: unknown;
}
