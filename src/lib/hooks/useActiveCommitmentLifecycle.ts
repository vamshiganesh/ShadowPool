import { useEffect } from 'react'
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

/** Keeps the order lifecycle stepper in sync with on-chain state for the active commitment. */
export function useActiveCommitmentLifecycle(draftHash?: string | null) {
  useRestoreActiveCommitment()

  const { address } = useAccount()
  const activeCommitment = useTradeStore((s) => s.activeCommitment)
  const setActiveLifecycleStage = useTradeStore((s) => s.setActiveLifecycleStage)
  const commitments = useProtocolEventStore((s) => s.commitments)
  const settlements = useProtocolEventStore((s) => s.settlements)

  const trackedHash = activeCommitment?.hash ?? (draftHash as `0x${string}` | undefined)

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
}
