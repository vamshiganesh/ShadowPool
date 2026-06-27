import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { useTradeStore } from '@/store/tradeStore'
import { useProtocolEventStore } from '@/store/protocolEventStore'
import { loadLocalCommitments } from '@/lib/protocol/localCommitments'
import {
  commitmentToLifecycleStage,
  findCounterpartyCommitment,
} from '@/lib/protocol/types'
import { findSettlementForCommitment } from '@/lib/protocol/buildCommitmentDetail'
import { useRestoreActiveCommitment } from '@/lib/hooks/useRestoreActiveCommitment'
import { fetchStatus, type MatcherOrderStatus } from '@/lib/protocol/matcherApi'

/** Poll the matcher API every N ms while the order is pending/matched/proving. */
const MATCHER_POLL_MS = 8_000

function isPairAwaitingProof(
  hash: string,
  counterpartyHash: string | undefined,
): boolean {
  if (!counterpartyHash) return false
  const local = loadLocalCommitments()
  const hasSelf = local.some((c) => c.hash.toLowerCase() === hash.toLowerCase())
  const hasCounterparty = local.some(
    (c) => c.hash.toLowerCase() === counterpartyHash.toLowerCase(),
  )
  return hasSelf && hasCounterparty
}

/**
 * Map matcher service status → lifecycle stage id.
 * The chain event store remains the authoritative source for `settled`;
 * we only use the matcher for the intermediate proving stages.
 */
function matcherStatusToStage(
  status: MatcherOrderStatus,
): 'onchain' | 'matched' | 'proving' | 'settled' | null {
  switch (status) {
    case 'pending':  return 'onchain'
    case 'matched':  return 'matched'
    case 'proving':  return 'proving'
    case 'settled':  return 'settled'
    default:         return null
  }
}

/** Keeps the order lifecycle stepper in sync with on-chain state for the active commitment. */
export function useActiveCommitmentLifecycle(draftHash?: string | null) {
  useRestoreActiveCommitment()

  const { address } = useAccount()
  const activeCommitment = useTradeStore((s) => s.activeCommitment)
  const activeLifecycleStage = useTradeStore((s) => s.activeLifecycleStage)
  const setActiveLifecycleStage = useTradeStore((s) => s.setActiveLifecycleStage)
  const commitments = useProtocolEventStore((s) => s.commitments)
  const settlements = useProtocolEventStore((s) => s.settlements)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const trackedHash = activeCommitment?.hash ?? (draftHash as `0x${string}` | undefined)

  // ── Chain / local state sync (primary) ────────────────────────────────────
  useEffect(() => {
    if (!trackedHash) {
      setActiveLifecycleStage('created')
      return
    }

    const chain = commitments.get(trackedHash.toLowerCase())
    const settlement = findSettlementForCommitment(trackedHash, settlements)
    const openCommitments = [...commitments.values()].filter((c) => c.status === 'onchain')
    const counterparty = chain ? findCounterpartyCommitment(chain, openCommitments) : undefined
    const localMeta = loadLocalCommitments().find(
      (c) => c.hash.toLowerCase() === trackedHash.toLowerCase(),
    )
    const hasSubmittedTx = Boolean(activeCommitment?.txHash ?? localMeta?.txHash ?? chain?.txHash)

    const stage = commitmentToLifecycleStage(chain, settlement, {
      hasComputedHash: Boolean(draftHash ?? trackedHash),
      hasCounterparty: Boolean(counterparty),
      isProving:
        !settlement &&
        isPairAwaitingProof(trackedHash, counterparty?.hash),
    })

    if (!chain && !settlement && hasSubmittedTx && stage === 'created') {
      setActiveLifecycleStage('onchain')
      return
    }

    setActiveLifecycleStage(stage)
  }, [
    trackedHash,
    draftHash,
    activeCommitment,
    address,
    commitments,
    settlements,
    setActiveLifecycleStage,
  ])

  // ── Matcher API poll (enriches proving / settled stages) ──────────────────
  useEffect(() => {
    if (!trackedHash) return

    // Clear any previous interval
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    const poll = async () => {
      try {
        const status = await fetchStatus(trackedHash)
        if (!status) return

        const stage = matcherStatusToStage(status.status)
        if (!stage) return

        // Only advance the stepper — never go backwards
        const stageOrder: Record<string, number> = {
          created: 0, onchain: 1, matched: 2, proving: 3, settled: 4,
        }
        if ((stageOrder[stage] ?? 0) > (stageOrder[activeLifecycleStage] ?? 0)) {
          setActiveLifecycleStage(stage)
        }

        // Stop polling once terminal
        if (status.status === 'settled' || status.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
        }
      } catch {
        // Silent — matcher service might be offline (fallback still works)
      }
    }

    void poll()
    pollRef.current = setInterval(() => void poll(), MATCHER_POLL_MS)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackedHash, setActiveLifecycleStage])
}
