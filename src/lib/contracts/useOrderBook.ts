import { useEffect, useRef } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useSignMessage } from 'wagmi'
import { parseEther } from 'viem'
import { addresses } from '@/lib/contracts/addresses'
import { saveLocalCommitment } from '@/lib/protocol/localCommitments'
import { useTradeStore, type ActiveCommitment } from '@/store/tradeStore'
import {
  uploadSecret,
  buildUploadMessage,
} from '@/lib/protocol/matcherApi'

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
/** Convert human-readable amount string to wei decimal string (BigInt-safe). */
function toWeiString(amount: string): string {
  const cleaned = amount.replace(/,/g, '').trim()
  const parts = cleaned.split('.')
  const whole = parts[0] || '0'
  const frac = (parts[1] ?? '').padEnd(18, '0').slice(0, 18)
  return (BigInt(whole) * 10n ** 18n + BigInt(frac || '0')).toString()
}

/** Convert human-readable price string to micro-USDC decimal string. */
function toMicroString(price: string): string {
  const cleaned = price.replace(/,/g, '').trim()
  const parts = cleaned.split('.')
  const whole = parts[0] || '0'
  const frac = (parts[1] ?? '').padEnd(6, '0').slice(0, 6)
  return (BigInt(whole) * 1_000_000n + BigInt(frac || '0')).toString()
}

export function useSubmitCommitment() {
  const snapshotRef = useRef<CommitmentSubmitSnapshot | null>(null)
  const handledTxRef = useRef<string | null>(null)
  const uploadedRef = useRef<string | null>(null)

  const setActiveCommitment = useTradeStore((s) => s.setActiveCommitment)
  const setActiveLifecycleStage = useTradeStore((s) => s.setActiveLifecycleStage)
  const openCommitmentDrawer = useTradeStore((s) => s.openCommitmentDrawer)
  const setMatcherUploadStatus = useTradeStore((s) => s.setMatcherUploadStatus)

  const { writeContractAsync, isPending, data: txHash } = useWriteContract()
  const { signMessageAsync } = useSignMessage()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    if (!isSuccess || !txHash || !snapshotRef.current) return
    if (handledTxRef.current === txHash) return
    handledTxRef.current = txHash

    const snapshot = snapshotRef.current
    const commitment: ActiveCommitment = { ...snapshot, txHash }

    saveLocalCommitment({
      ...commitment,
      nonce: snapshot.nonce,
      salt: snapshot.salt,
      trader: snapshot.trader,
      submittedAt: Math.floor(Date.now() / 1000),
    })
    setActiveCommitment(commitment)
    setActiveLifecycleStage('onchain')
    openCommitmentDrawer()

    // ── Upload secrets to the matcher service (non-blocking) ───────────────
    if (uploadedRef.current === txHash) return
    uploadedRef.current = txHash

    const doUpload = async () => {
      if (!snapshot.trader) return
      const message = buildUploadMessage(snapshot.hash, snapshot.nonce)
      try {
        setMatcherUploadStatus('signing')
        const signature = await signMessageAsync({ message })
        setMatcherUploadStatus('uploading')
        await uploadSecret({
          commitmentHash: snapshot.hash,
          assetAmount: toWeiString(snapshot.amount),
          limitPrice: toMicroString(snapshot.price),
          nonce: snapshot.nonce,
          salt: snapshot.salt,
          trader: snapshot.trader!,
          signature,
        })
        setMatcherUploadStatus('uploaded')
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setMatcherUploadStatus('error', message)
        console.warn('[useSubmitCommitment] Matcher secret upload failed:', err)
      }
    }

    void doUpload()
  }, [
    isSuccess,
    txHash,
    setActiveCommitment,
    setActiveLifecycleStage,
    openCommitmentDrawer,
    signMessageAsync,
    setMatcherUploadStatus,
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
