import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { ORDER_BOOK_ABI, ORDER_STATUS } from '@/lib/contracts/abis'
import { addresses } from '@/lib/contracts/addresses'
import { loadLocalCommitments } from '@/lib/protocol/localCommitments'
import type { ChainCommitment } from '@/lib/protocol/types'
import { getSepoliaRpcUrl } from '@/lib/protocol/rpcUrl'

const readClient = createPublicClient({
  chain: sepolia,
  transport: http(getSepoliaRpcUrl()),
})

function mapOnChainStatus(code: number): ChainCommitment['status'] {
  if (code === ORDER_STATUS.Settled) return 'settled'
  if (code === ORDER_STATUS.Cancelled) return 'cancelled'
  return 'onchain'
}

function parseAmountWei(amount: string): bigint {
  const cleaned = amount.replace(/,/g, '').trim()
  if (!cleaned) return 0n
  const parts = cleaned.split('.')
  const whole = parts[0] || '0'
  const frac = (parts[1] ?? '').padEnd(18, '0').slice(0, 18)
  return BigInt(whole) * 10n ** 18n + BigInt(frac || '0')
}

/**
 * Instant seed from localStorage — no RPC. Used so Orders/Stats render immediately
 * while background sync and historical indexing run.
 */
export function seedCommitmentsFromLocal(): ChainCommitment[] {
  const local = loadLocalCommitments()
  const results: ChainCommitment[] = []

  for (const meta of local) {
    if (!meta.txHash) continue
    results.push({
      hash: meta.hash,
      trader:
        meta.trader ??
        ('0x0000000000000000000000000000000000000000' as `0x${string}`),
      blockNumber: 0n,
      txHash: meta.txHash,
      escrowWei: parseAmountWei(meta.amount),
      status: 'onchain',
      blockTimestamp: meta.submittedAt,
    })
  }

  return results
}

/**
 * Sync wallet-local commitments via cheap per-hash eth_call reads.
 * Avoids eth_getLogs entirely — works on Alchemy free tier.
 */
export async function syncLocalCommitmentStatuses(): Promise<ChainCommitment[]> {
  const local = loadLocalCommitments()
  const results: ChainCommitment[] = []

  for (const meta of local) {
    if (!meta.txHash) continue

    try {
      const [statusCode, escrowResult] = await Promise.all([
        readClient.readContract({
          address: addresses.orderBook,
          abi: ORDER_BOOK_ABI,
          functionName: 'statusOf',
          args: [meta.hash],
        }),
        readClient
          .readContract({
            address: addresses.orderBook,
            abi: ORDER_BOOK_ABI,
            functionName: 'getEscrow',
            args: [meta.hash],
          })
          .catch(() => null),
      ])

      if (statusCode === ORDER_STATUS.None) continue

      const trader =
        (escrowResult?.[0] as `0x${string}` | undefined) ??
        meta.trader ??
        ('0x0000000000000000000000000000000000000000' as `0x${string}`)
      const escrowWei = escrowResult?.[1] ?? 0n

      results.push({
        hash: meta.hash,
        trader,
        blockNumber: 0n,
        txHash: meta.txHash,
        escrowWei,
        status: mapOnChainStatus(Number(statusCode)),
        blockTimestamp: meta.submittedAt,
      })
    } catch {
      /* skip unreachable entries */
    }
  }

  return results
}
