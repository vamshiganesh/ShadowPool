import {
  createPublicClient,
  http,
  parseAbiItem,
  type AbiEvent,
  type Log,
} from 'viem'
import { sepolia } from 'viem/chains'
import { ORDER_BOOK_ABI } from '@/lib/contracts/abis'
import { addresses, areContractsDeployed } from '@/lib/contracts/addresses'
import type { ChainCommitment, ChainSettlement } from '@/lib/protocol/types'
import { getSepoliaRpcUrl } from '@/lib/protocol/rpcUrl'

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(getSepoliaRpcUrl()),
})

/** Alchemy free = 10 blocks; chunk conservatively so bootstrap works without PAYG. */
const LOG_CHUNK_SIZE = 10n
const LOG_CHUNK_BATCH = 5
const LOG_CHUNK_DELAY_MS = 120

type EventLogFilter = {
  address: `0x${string}`
  event: AbiEvent
  fromBlock: bigint
  toBlock?: 'latest' | bigint
}

async function getLogsChunked(params: EventLogFilter & { toBlock: bigint }): Promise<Log[]> {
  const from = params.fromBlock
  const to = params.toBlock

  const ranges: { from: bigint; to: bigint }[] = []
  let cursor = from
  while (cursor <= to) {
    const chunkEnd = cursor + LOG_CHUNK_SIZE - 1n > to ? to : cursor + LOG_CHUNK_SIZE - 1n
    ranges.push({ from: cursor, to: chunkEnd })
    cursor = chunkEnd + 1n
  }

  const logs: Log[] = []
  for (let i = 0; i < ranges.length; i += LOG_CHUNK_BATCH) {
    const batch = ranges.slice(i, i + LOG_CHUNK_BATCH)
    const chunks = await Promise.all(
      batch.map(({ from: chunkFrom, to: chunkTo }) =>
        publicClient.getLogs({
          address: params.address,
          event: params.event,
          fromBlock: chunkFrom,
          toBlock: chunkTo,
        }),
      ),
    )
    for (const chunk of chunks) logs.push(...chunk)
    if (i + LOG_CHUNK_BATCH < ranges.length) {
      await new Promise((r) => setTimeout(r, LOG_CHUNK_DELAY_MS))
    }
  }
  return logs
}

async function getLogsSafe(params: EventLogFilter): Promise<Log[]> {
  const latest = await publicClient.getBlockNumber()
  const toBlock = params.toBlock === undefined || params.toBlock === 'latest' ? latest : params.toBlock
  return getLogsChunked({ ...params, toBlock })
}

function getFromBlock(): bigint {
  const envBlock = import.meta.env.VITE_DEPLOYMENT_BLOCK
  if (envBlock) return BigInt(envBlock)
  if (addresses.deployBlock) return BigInt(addresses.deployBlock)
  return 0n
}

async function fetchEscrow(commitment: `0x${string}`): Promise<bigint> {
  try {
    const [, amount] = await publicClient.readContract({
      address: addresses.orderBook,
      abi: ORDER_BOOK_ABI,
      functionName: 'getEscrow',
      args: [commitment],
    })
    return amount
  } catch {
    return 0n
  }
}

/** Run async work over items with bounded concurrency (avoids sequential N+1 RPC). */
async function mapConcurrent<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = 6,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let index = 0

  async function worker() {
    while (index < items.length) {
      const i = index++
      results[i] = await fn(items[i])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  )
  return results
}

export async function bootstrapProtocolEvents(): Promise<{
  commitments: ChainCommitment[]
  settlements: ChainSettlement[]
}> {
  if (!areContractsDeployed()) {
    return { commitments: [], settlements: [] }
  }

  const fromBlock = getFromBlock()

  const [submitLogs, settledLogs, cancelLogs, orderSettledLogs] = await Promise.all([
    getLogsSafe({
      address: addresses.orderBook,
      event: parseAbiItem(
        'event CommitmentSubmitted(bytes32 indexed commitment, address indexed trader, uint256 blockNumber)',
      ) as AbiEvent,
      fromBlock,
      toBlock: 'latest',
    }),
    getLogsSafe({
      address: addresses.orderBook,
      event: parseAbiItem(
        'event CommitmentSettled(bytes32 indexed commitment, address indexed trader)',
      ) as AbiEvent,
      fromBlock,
      toBlock: 'latest',
    }),
    getLogsSafe({
      address: addresses.orderBook,
      event: parseAbiItem(
        'event CommitmentCancelled(bytes32 indexed commitment, address indexed trader)',
      ) as AbiEvent,
      fromBlock,
      toBlock: 'latest',
    }),
    getLogsSafe({
      address: addresses.settlement,
      event: parseAbiItem(
        'event OrdersSettled(bytes32 indexed commitmentA, bytes32 indexed commitmentB, uint256 clearingPrice, address traderA, address traderB, uint256 settledBlock)',
      ) as AbiEvent,
      fromBlock,
      toBlock: 'latest',
    }),
  ])

  const commitmentMap = new Map<string, ChainCommitment>()

  const submitCommitments = await mapConcurrent(submitLogs, async (log) => {
    const args = (log as Log & {
      args: {
        commitment: `0x${string}`
        trader: `0x${string}`
        blockNumber: bigint
      }
    }).args
    const hash = args.commitment
    const escrowWei = await fetchEscrow(hash)
    return {
      hash,
      trader: args.trader,
      blockNumber: log.blockNumber ?? args.blockNumber,
      txHash: log.transactionHash!,
      escrowWei,
      status: 'onchain' as const,
      blockTimestamp: undefined,
    }
  })

  for (const c of submitCommitments) {
    commitmentMap.set(c.hash.toLowerCase(), c)
  }

  for (const log of cancelLogs) {
    const args = (log as Log & { args: { commitment: `0x${string}`; trader: `0x${string}` } }).args
    const key = args.commitment.toLowerCase()
    const existing = commitmentMap.get(key)
    if (existing) {
      commitmentMap.set(key, { ...existing, status: 'cancelled' })
    }
  }

  for (const log of settledLogs) {
    const args = (log as Log & { args: { commitment: `0x${string}`; trader: `0x${string}` } }).args
    const key = args.commitment.toLowerCase()
    const existing = commitmentMap.get(key)
    if (existing) {
      commitmentMap.set(key, { ...existing, status: 'settled' })
    }
  }

  const settlements: ChainSettlement[] = []

  const settledRecords = await mapConcurrent(orderSettledLogs, async (log) => {
    const args = (log as Log & {
      args: {
        commitmentA: `0x${string}`
        commitmentB: `0x${string}`
        clearingPrice: bigint
        traderA: `0x${string}`
        traderB: `0x${string}`
        settledBlock: bigint
      }
    }).args

    const [escrowA, escrowB] = await Promise.all([
      fetchEscrow(args.commitmentA),
      fetchEscrow(args.commitmentB),
    ])

    return {
      settlement: {
        id: `${log.transactionHash}-${args.commitmentA}`,
        commitmentA: args.commitmentA,
        commitmentB: args.commitmentB,
        clearingPrice: args.clearingPrice,
        traderA: args.traderA,
        traderB: args.traderB,
        blockNumber: log.blockNumber ?? args.settledBlock,
        txHash: log.transactionHash!,
        blockTimestamp: undefined,
        escrowA,
        escrowB,
      } satisfies ChainSettlement,
      args,
      logBlock: log.blockNumber ?? args.settledBlock,
      logTx: log.transactionHash!,
    }
  })

  for (const { settlement, args, logBlock, logTx } of settledRecords) {
    settlements.push(settlement)

    for (const [hash, trader] of [
      [args.commitmentA, args.traderA],
      [args.commitmentB, args.traderB],
    ] as const) {
      const key = hash.toLowerCase()
      const existing = commitmentMap.get(key)
      if (existing) {
        commitmentMap.set(key, { ...existing, status: 'settled' })
      } else {
        commitmentMap.set(key, {
          hash,
          trader,
          blockNumber: logBlock,
          txHash: logTx,
          escrowWei: 0n,
          status: 'settled',
        })
      }
    }
  }

  settlements.sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1))

  return {
    commitments: [...commitmentMap.values()],
    settlements,
  }
}

export { publicClient }
