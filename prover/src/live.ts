/**
 * Match + prove + settle REAL on-chain orders using secrets exported from the UI.
 *
 * 1. Commit orders from each wallet in the Trade UI.
 * 2. On each browser: Orders → "Export Prover Pool" (downloads JSON).
 * 3. Merge exports into prover/orders.pool.json (array of order objects).
 * 4. Run: SUBMIT_ON_CHAIN=1 npm run prove:live
 */
import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync, existsSync } from "fs";
import { ethers } from "ethers";
import { runProver } from "./index";
import { isSubmitOnChainEnabled } from "./env";
import type { OrderCommitment } from "./types";
import addresses from "../../shared/addresses.json";

config({ path: resolve(__dirname, "../../.env") });

const ORDER_BOOK_ABI = [
  "function getOpenCommitments() view returns (bytes32[])",
  "function getEscrow(bytes32) view returns (address trader, uint256 amount)",
] as const;

interface PoolEntry {
  commitmentHash: string;
  assetAmount: string;
  limitPrice: string;
  nonce: string;
  salt: string;
  trader: string;
  escrowAmount?: string;
  submittedBlock?: number;
}

function parsePoolEntry(raw: PoolEntry): OrderCommitment {
  return {
    commitmentHash: raw.commitmentHash,
    assetAmount: BigInt(raw.assetAmount),
    limitPrice: BigInt(raw.limitPrice),
    nonce: BigInt(raw.nonce),
    salt: BigInt(raw.salt),
    trader: raw.trader,
    escrowAmount: BigInt(raw.escrowAmount ?? raw.assetAmount),
    submittedBlock: raw.submittedBlock ?? 0,
  };
}

async function enrichFromChain(orders: OrderCommitment[]): Promise<OrderCommitment[]> {
  const rpc = process.env.SEPOLIA_RPC_URL;
  if (!rpc) throw new Error("SEPOLIA_RPC_URL required");

  const provider = new ethers.JsonRpcProvider(rpc);
  const book = new ethers.Contract(addresses.orderBook, ORDER_BOOK_ABI, provider);

  const open: string[] = await book.getOpenCommitments();
  const openSet = new Set(open.map((h: string) => h.toLowerCase()));

  const enriched: OrderCommitment[] = [];
  for (const order of orders) {
    if (!openSet.has(order.commitmentHash.toLowerCase())) {
      console.warn(`[live] ${order.commitmentHash} not open on-chain — skipping`);
      continue;
    }
    const [trader, escrow] = await book.getEscrow(order.commitmentHash);
    enriched.push({
      ...order,
      trader,
      escrowAmount: escrow,
    });
  }
  return enriched;
}

async function main() {
  const poolPath = resolve(__dirname, "../orders.pool.json");
  if (!existsSync(poolPath)) {
    console.error(
      "[live] Missing prover/orders.pool.json\n" +
        "       Export from each wallet: Orders → Export Prover Pool, then merge JSON arrays.",
    );
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(poolPath, "utf8")) as PoolEntry[];
  if (!Array.isArray(raw) || raw.length < 2) {
    console.error("[live] orders.pool.json must be an array with at least 2 orders.");
    process.exit(1);
  }

  const parsed = raw.map(parsePoolEntry);
  const orders = await enrichFromChain(parsed);

  if (orders.length < 2) {
    console.error("[live] Fewer than 2 open on-chain orders with valid secrets.");
    process.exit(1);
  }

  await runProver(orders, { submit: isSubmitOnChainEnabled() });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
