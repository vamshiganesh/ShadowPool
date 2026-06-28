import { useEffect, type ReactNode } from 'react'
import { useWatchContractEvent, useBlockNumber } from 'wagmi'
import { ORDER_BOOK_ABI, SETTLEMENT_ABI } from '@/lib/contracts/abis'
import { addresses, areContractsDeployed } from '@/lib/contracts/addresses'
import { bootstrapProtocolEvents, publicClient } from '@/lib/protocol/bootstrap'
import {
  seedCommitmentsFromLocal,
  syncLocalCommitmentStatuses,
} from '@/lib/protocol/syncLocalStatuses'
import { useProtocolEventStore } from '@/store/protocolEventStore'
import type { ChainCommitment, ChainSettlement } from '@/lib/protocol/types'

/** Delay before heavy eth_getLogs historical index (keeps first paint fast). */
const HISTORY_INDEX_DELAY_MS = 2_500

export function ProtocolEventProvider({ children }: { children: ReactNode }) {
  const upsertCommitment = useProtocolEventStore((s) => s.upsertCommitment)
  const addSettlement = useProtocolEventStore((s) => s.addSettlement)
  const setListening = useProtocolEventStore((s) => s.setListening)
  const setBootstrapped = useProtocolEventStore((s) => s.setBootstrapped)
  const setBootstrapError = useProtocolEventStore((s) => s.setBootstrapError)
  const setLatestBlock = useProtocolEventStore((s) => s.setLatestBlock)

  const deployed = areContractsDeployed()

  useEffect(() => {
    if (!deployed) {
      setBootstrapped(true)
      return
    }

    let cancelled = false
    let historyStarted = false

    // ── Instant path: seed from localStorage + mark live (no RPC wait) ────────
    for (const c of seedCommitmentsFromLocal()) {
      upsertCommitment(c)
    }
    setBootstrapError(null)
    setBootstrapped(true)
    setListening(true)

    const syncLocal = async () => {
      try {
        const localSynced = await syncLocalCommitmentStatuses()
        if (cancelled) return
        for (const c of localSynced) upsertCommitment(c)
        setBootstrapError(null)
      } catch (err) {
        if (!cancelled) {
          setBootstrapError(err instanceof Error ? err.message : 'Sync failed')
        }
      }
    }

    const runHistoryIndex = async () => {
      if (cancelled || historyStarted) return
      historyStarted = true
      try {
        const { commitments, settlements } = await bootstrapProtocolEvents()
        if (cancelled) return
        for (const c of commitments) upsertCommitment(c)
        for (const s of settlements) addSettlement(s)
        setBootstrapError(null)
      } catch {
        /* getLogs indexing is optional — local sync + live watchers cover the app */
      }
    }

    // Light sync first, then defer the expensive getLogs scan.
    void syncLocal()
    const historyTimer = window.setTimeout(() => {
      void runHistoryIndex()
    }, HISTORY_INDEX_DELAY_MS)

    // On tab focus, refresh local statuses only — not the full history scan.
    const onFocus = () => {
      void syncLocal()
    }
    window.addEventListener('focus', onFocus)

    return () => {
      cancelled = true
      window.clearTimeout(historyTimer)
      window.removeEventListener('focus', onFocus)
    }
  }, [deployed, upsertCommitment, addSettlement, setBootstrapped, setBootstrapError, setListening])

  // Mark live once watchers are registered for deployed contracts.
  useEffect(() => {
    if (deployed) setListening(true)
  }, [deployed, setListening])

  const { data: blockNumber } = useBlockNumber({ watch: deployed })

  useEffect(() => {
    if (blockNumber) setLatestBlock(blockNumber)
  }, [blockNumber, setLatestBlock])

  useWatchContractEvent({
    address: addresses.orderBook,
    abi: ORDER_BOOK_ABI,
    eventName: 'CommitmentSubmitted',
    enabled: deployed,
    onLogs: async (logs) => {
      for (const log of logs) {
        const args = log.args as {
          commitment: `0x${string}`
          trader: `0x${string}`
          blockNumber: bigint
        }
        let escrowWei = 0n
        try {
          const [, amount] = await publicClient.readContract({
            address: addresses.orderBook,
            abi: ORDER_BOOK_ABI,
            functionName: 'getEscrow',
            args: [args.commitment],
          })
          escrowWei = amount
        } catch {
          /* ignore */
        }

        let blockTimestamp: number | undefined
        if (log.blockNumber) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
            blockTimestamp = Number(block.timestamp)
          } catch {
            /* ignore */
          }
        }

        const record: ChainCommitment = {
          hash: args.commitment,
          trader: args.trader,
          blockNumber: log.blockNumber ?? args.blockNumber,
          txHash: log.transactionHash!,
          escrowWei,
          status: 'onchain',
          blockTimestamp,
        }
        upsertCommitment(record)
      }
    },
  })

  useWatchContractEvent({
    address: addresses.orderBook,
    abi: ORDER_BOOK_ABI,
    eventName: 'CommitmentSettled',
    enabled: deployed,
    onLogs: (logs) => {
      for (const log of logs) {
        const args = log.args as { commitment: `0x${string}`; trader: `0x${string}` }
        const key = args.commitment.toLowerCase()
        const store = useProtocolEventStore.getState()
        const existing = store.commitments.get(key)
        if (existing) {
          upsertCommitment({ ...existing, status: 'settled' })
        } else {
          upsertCommitment({
            hash: args.commitment,
            trader: args.trader,
            blockNumber: log.blockNumber ?? 0n,
            txHash: log.transactionHash!,
            escrowWei: 0n,
            status: 'settled',
          })
        }
      }
    },
  })

  useWatchContractEvent({
    address: addresses.orderBook,
    abi: ORDER_BOOK_ABI,
    eventName: 'CommitmentCancelled',
    enabled: deployed,
    onLogs: (logs) => {
      for (const log of logs) {
        const args = log.args as { commitment: `0x${string}` }
        const key = args.commitment.toLowerCase()
        const store = useProtocolEventStore.getState()
        const existing = store.commitments.get(key)
        if (existing) {
          upsertCommitment({ ...existing, status: 'cancelled' })
        }
      }
    },
  })

  useWatchContractEvent({
    address: addresses.settlement,
    abi: SETTLEMENT_ABI,
    eventName: 'OrdersSettled',
    enabled: deployed,
    onLogs: async (logs) => {
      for (const log of logs) {
        const args = log.args as {
          commitmentA: `0x${string}`
          commitmentB: `0x${string}`
          clearingPrice: bigint
          traderA: `0x${string}`
          traderB: `0x${string}`
          settledBlock: bigint
        }

        let blockTimestamp: number | undefined
        if (log.blockNumber) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
            blockTimestamp = Number(block.timestamp)
          } catch {
            /* ignore */
          }
        }

        let escrowA = 0n
        let escrowB = 0n
        try {
          const [, a] = await publicClient.readContract({
            address: addresses.orderBook,
            abi: ORDER_BOOK_ABI,
            functionName: 'getEscrow',
            args: [args.commitmentA],
          })
          const [, b] = await publicClient.readContract({
            address: addresses.orderBook,
            abi: ORDER_BOOK_ABI,
            functionName: 'getEscrow',
            args: [args.commitmentB],
          })
          escrowA = a
          escrowB = b
        } catch {
          /* ignore */
        }

        const settlement: ChainSettlement = {
          id: `${log.transactionHash}-${args.commitmentA}`,
          commitmentA: args.commitmentA,
          commitmentB: args.commitmentB,
          clearingPrice: args.clearingPrice,
          traderA: args.traderA,
          traderB: args.traderB,
          blockNumber: log.blockNumber ?? args.settledBlock,
          txHash: log.transactionHash!,
          blockTimestamp,
          escrowA,
          escrowB,
        }
        addSettlement(settlement)

        for (const [hash, trader] of [
          [args.commitmentA, args.traderA],
          [args.commitmentB, args.traderB],
        ] as const) {
          const key = hash.toLowerCase()
          const existing = useProtocolEventStore.getState().commitments.get(key)
          if (existing) {
            upsertCommitment({ ...existing, status: 'settled' })
          } else {
            upsertCommitment({
              hash,
              trader,
              blockNumber: log.blockNumber ?? args.settledBlock,
              txHash: log.transactionHash!,
              escrowWei: 0n,
              status: 'settled',
              blockTimestamp,
            })
          }
        }
      }
    },
  })

  return children
}
