/**
 * Watches the OrderBook contract for CommitmentSubmitted events using ethers.js.
 *
 * When a new commitment lands on-chain, we check whether we already have
 * the secret for it (uploaded via POST /v1/secrets).  If yes, the matching
 * engine is triggered immediately rather than waiting for the next poll cycle.
 *
 * WebSocket preferred (stable stream); falls back to HTTP polling every 12 s
 * when SEPOLIA_WS_URL is not set.
 */
import { ethers } from 'ethers'
import { env } from '../env'
import { getSecretByHash } from '../db/queries'
import { triggerMatch } from '../engine/matcher'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const addresses = require('../../../../shared/addresses.json') as { orderBook: string }

const ORDER_BOOK_ABI = [
  'event CommitmentSubmitted(address indexed trader, bytes32 commitment)',
] as const

function onCommitmentSubmitted(
  _trader: string,
  commitment: string,
): void {
  console.log(`[watcher] CommitmentSubmitted: ${commitment}`)

  getSecretByHash(commitment)
    .then((secret) => {
      if (secret) {
        console.log(`[watcher] Secret stored for ${commitment} — triggering match`)
        return triggerMatch()
      }
    })
    .catch((err) => console.error('[watcher] handler error:', err))
}

export function startChainWatcher(): () => void {
  const useWs = Boolean(env.SEPOLIA_WS_URL)
  console.log(
    `[watcher] Subscribing to CommitmentSubmitted on ${addresses.orderBook} ` +
    `via ${useWs ? 'WebSocket' : 'HTTP polling'}`,
  )

  if (useWs) {
    // WebSocket provider — persistent event subscription
    const provider = new ethers.WebSocketProvider(env.SEPOLIA_WS_URL!)
    const contract = new ethers.Contract(addresses.orderBook, ORDER_BOOK_ABI, provider)
    contract.on('CommitmentSubmitted', onCommitmentSubmitted)

    return () => {
      contract.off('CommitmentSubmitted', onCommitmentSubmitted)
      void provider.destroy()
    }
  }

  // HTTP polling fallback — poll for new logs every 12 s
  const provider = new ethers.JsonRpcProvider(env.SEPOLIA_RPC_URL)
  const contract = new ethers.Contract(addresses.orderBook, ORDER_BOOK_ABI, provider)
  const filter = contract.filters.CommitmentSubmitted()

  let lastBlock = 0
  const timer = setInterval(async () => {
    try {
      const current = await provider.getBlockNumber()
      if (lastBlock === 0) lastBlock = current - 1
      if (current <= lastBlock) return

      const logs = await contract.queryFilter(filter, lastBlock + 1, current)
      lastBlock = current

      for (const log of logs) {
        const parsed = contract.interface.parseLog(log)
        if (parsed) {
          onCommitmentSubmitted(
            parsed.args[0] as string,
            parsed.args[1] as string,
          )
        }
      }
    } catch (err) {
      console.error('[watcher] poll error:', err)
    }
  }, 12_000)

  return () => clearInterval(timer)
}
