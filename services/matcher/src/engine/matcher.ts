/**
 * Matching engine.
 *
 * Fetches all 'pending' secrets from Supabase, validates they are still open
 * on-chain, then looks for a bid/ask pair that crosses.  A bid crosses an ask
 * when bid.limitPrice >= ask.limitPrice (willing buyer meets willing seller).
 * The clearing price is the midpoint.
 *
 * This mirrors the logic in prover/src/matcher.ts but runs server-side so
 * no secrets ever touch the client browser.
 */
import { ethers } from 'ethers'
import { getPendingSecrets, setOrderStatus, createMatchJob } from '../db/queries'
import type { SecretPayload } from '../db/queries'
import { env } from '../env'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const addresses = require('../../../../shared/addresses.json') as { orderBook: string }

const ORDER_BOOK_ABI = [
  'function getOpenCommitments() view returns (bytes32[])',
] as const

let matchRunning = false

/** Call this after any new secret arrives or a chain event fires. */
export async function triggerMatch(): Promise<void> {
  if (matchRunning) return
  matchRunning = true
  try {
    await runMatchCycle()
  } finally {
    matchRunning = false
  }
}

async function getOpenCommitmentsOnChain(): Promise<Set<string>> {
  const provider = new ethers.JsonRpcProvider(env.SEPOLIA_RPC_URL)
  const book = new ethers.Contract(addresses.orderBook, ORDER_BOOK_ABI, provider)
  const open: string[] = await book.getOpenCommitments()
  return new Set(open.map((h: string) => h.toLowerCase()))
}

function findCrossingPair(
  secrets: SecretPayload[],
): { a: SecretPayload; b: SecretPayload; clearingPrice: bigint } | null {
  // Matching criteria must mirror prover/src/matcher.ts exactly so we only
  // attempt to prove pairs that will satisfy the circuit constraints:
  //   1. bid.limitPrice >= ask.limitPrice  (price ranges cross)
  //   2. bid.assetAmount === ask.assetAmount  (exact fill size — circuit requirement)
  //
  // Determine bid/ask: higher-priced order is the bid (buyer paying more).
  for (let i = 0; i < secrets.length; i++) {
    for (let j = i + 1; j < secrets.length; j++) {
      const s1 = secrets[i]
      const s2 = secrets[j]

      const p1 = BigInt(s1.limitPrice)
      const p2 = BigInt(s2.limitPrice)
      const a1 = BigInt(s1.assetAmount)
      const a2 = BigInt(s2.assetAmount)

      // ── Amount must match exactly (circuit constraint) ────────────────────
      if (a1 !== a2) {
        console.log(
          `[matcher] Skipping pair ${s1.commitmentHash.slice(0, 10)}↔${s2.commitmentHash.slice(0, 10)}: ` +
          `assetAmount mismatch (${a1} vs ${a2})`,
        )
        continue
      }

      // ── Price must cross ──────────────────────────────────────────────────
      const [bid, ask] = p1 >= p2 ? [s1, s2] : [s2, s1]
      const bidPrice = BigInt(bid.limitPrice)
      const askPrice = BigInt(ask.limitPrice)

      if (bidPrice >= askPrice) {
        const clearingPrice = (bidPrice + askPrice) / 2n
        return { a: bid, b: ask, clearingPrice }
      }
    }
  }
  return null
}

async function runMatchCycle(): Promise<void> {
  console.log('[matcher] Running match cycle…')

  const secrets = await getPendingSecrets()
  if (secrets.length < 2) {
    console.log(`[matcher] Only ${secrets.length} pending secret(s) — waiting for more`)
    return
  }

  // Filter to only commitments that are still open on-chain
  let openSet: Set<string>
  try {
    openSet = await getOpenCommitmentsOnChain()
  } catch (err) {
    console.error('[matcher] Could not fetch on-chain open commitments:', err)
    return
  }

  const live = secrets.filter((s) => openSet.has(s.commitmentHash.toLowerCase()))

  if (live.length < 2) {
    console.log(`[matcher] ${live.length} live secret(s) after chain filter`)
    return
  }

  const pair = findCrossingPair(live)
  if (!pair) {
    console.log('[matcher] No crossing pair found yet')
    return
  }

  const { a, b, clearingPrice } = pair
  console.log(`[matcher] Match found! A=${a.commitmentHash} B=${b.commitmentHash} price=${clearingPrice}`)

  // Mark both secrets as matched and create a proof job
  const matchedAt = new Date().toISOString()
  await Promise.all([
    setOrderStatus(a.commitmentHash, 'matched', { matched_at: matchedAt }),
    setOrderStatus(b.commitmentHash, 'matched', { matched_at: matchedAt }),
  ])

  await createMatchJob(a.commitmentHash, b.commitmentHash, clearingPrice)
  console.log('[matcher] Match job created — prover worker will pick it up')
}
