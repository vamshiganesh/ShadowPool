import * as snarkjs from "snarkjs";
import type { Groth16Proof, SettlementCalldata } from "./types";

/**
 * Parse snarkjs `exportSolidityCallData` output into typed arrays for
 * DarkPoolSettlement.settle(pA, pB, pC, commitmentA, commitmentB, clearingPrice).
 *
 * snarkjs returns a string like:
 *   ["0x..","0x.."],[["0x..","0x.."],["0x..","0x.."]],["0x..","0x.."],["sig0","sig1","sig2"]
 */
export async function proofToSolidityCalldata(
  proof: Groth16Proof,
  publicSignals: string[],
): Promise<SettlementCalldata> {
  const raw = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
  const parsed = JSON.parse(`[${raw}]`) as [
    [string, string],
    [[string, string], [string, string]],
    [string, string],
    [string, string, string],
  ];

  const toBig = (h: string) => BigInt(h);

  return {
    pA: [toBig(parsed[0][0]), toBig(parsed[0][1])],
    pB: [
      [toBig(parsed[1][0][0]), toBig(parsed[1][0][1])],
      [toBig(parsed[1][1][0]), toBig(parsed[1][1][1])],
    ],
    pC: [toBig(parsed[2][0]), toBig(parsed[2][1])],
    publicSignals: [
      BigInt(parsed[3][0]),
      BigInt(parsed[3][1]),
      BigInt(parsed[3][2]),
    ],
  };
}
