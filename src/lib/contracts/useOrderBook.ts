import { useEffect, useRef } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { addresses } from '@/lib/contracts/addresses'
import { saveLocalCommitment } from '@/lib/protocol/localCommitments'
import { useTradeStore, type ActiveCommitment } from '@/store/tradeStore'

const ORDER_BOOK_ABI = [
  {
    name: 'submitCommitment',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'cancelCommitment',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'getOpenCommitments',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
] as const

export interface CommitmentSubmitSnapshot {
  hash: `0x${string}`
  side: ActiveCommitment['side']
  price: string
  amount: string
  nonce: string
  salt: string
  trader?: `0x${string}`
}

/**
 * Submits commitments on-chain and handles post-success side effects exactly once
 * per transaction (avoids re-opening the drawer when the user edits price/amount).
 */
export function useSubmitCommitment() {
  const snapshotRef = useRef<CommitmentSubmitSnapshot | null>(null)
  const handledTxRef = useRef<string | null>(null)

  const setActiveCommitment = useTradeStore((s) => s.setActiveCommitment)
  const setActiveLifecycleStage = useTradeStore((s) => s.setActiveLifecycleStage)
  const openCommitmentDrawer = useTradeStore((s) => s.openCommitmentDrawer)

  const { writeContractAsync, isPending, data: txHash } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    if (!isSuccess || !txHash || !snapshotRef.current) return
    if (handledTxRef.current === txHash) return
    handledTxRef.current = txHash

    const commitment: ActiveCommitment = {
      ...snapshotRef.current,
      txHash,
    }

    saveLocalCommitment({
      ...commitment,
      nonce: snapshotRef.current.nonce,
      salt: snapshotRef.current.salt,
      trader: snapshotRef.current.trader,
      submittedAt: Math.floor(Date.now() / 1000),
    })
    setActiveCommitment(commitment)
    setActiveLifecycleStage('onchain')
    openCommitmentDrawer()
  }, [
    isSuccess,
    txHash,
    setActiveCommitment,
    setActiveLifecycleStage,
    openCommitmentDrawer,
  ])

  const submit = async (snapshot: CommitmentSubmitSnapshot) => {
    const cleaned = snapshot.amount.replace(/,/g, '').trim()
    snapshotRef.current = snapshot
    return writeContractAsync({
      address: addresses.orderBook as `0x${string}`,
      abi: ORDER_BOOK_ABI,
      functionName: 'submitCommitment',
      args: [snapshot.hash],
      value: parseEther(cleaned),
    })
  }

  return {
    submit,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  }
}
