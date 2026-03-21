import type { OrderCommitment, MatchedPair } from "./types";

/**
 * Find a matching pair from the open commitment pool.
 *
 * Matching criteria (v1):
 *   - bid.limitPrice <= ask.limitPrice  (price ranges overlap)
 *   - bid.assetAmount === ask.assetAmount (exact fill size)
 *   - clearingPrice = midpoint of the two limit prices (integer division)
 *
 * Circuit convention: orderA is the maker bid (lower floor), orderB is the
 * taker ask (higher ceiling). clearingPrice must satisfy:
 *   limitPrice_A <= clearingPrice <= limitPrice_B
 *
 * v1: private order fields are visible to the prover. v2: MPC matching.
 */
export function findMatch(orders: OrderCommitment[]): MatchedPair | null {
  for (let i = 0; i < orders.length; i++) {
    for (let j = i + 1; j < orders.length; j++) {
      const a = orders[i];
      const b = orders[j];

      const bid = a.limitPrice <= b.limitPrice ? a : b;
      const ask = a.limitPrice <= b.limitPrice ? b : a;

      if (bid.assetAmount !== ask.assetAmount) continue;
      if (bid.limitPrice > ask.limitPrice) continue;

      const clearingPrice = (bid.limitPrice + ask.limitPrice) / 2n;

      return {
        orderA: bid,
        orderB: ask,
        clearingPrice,
      };
    }
  }

  return null;
}
