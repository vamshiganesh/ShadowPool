import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { loadLocalCommitments } from '@/lib/protocol/localCommitments'
import { useTradeStore } from '@/store/tradeStore'

/** Restores the most recent on-chain commitment for the connected wallet into trade state. */
export function useRestoreActiveCommitment() {
  const { address } = useAccount()
  const activeCommitment = useTradeStore((s) => s.activeCommitment)
  const setActiveCommitment = useTradeStore((s) => s.setActiveCommitment)

  useEffect(() => {
    if (activeCommitment || !address) return

    const latest = loadLocalCommitments()
      .filter(
        (c) =>
          c.txHash &&
          c.trader?.toLowerCase() === address.toLowerCase(),
      )
      .sort((a, b) => b.submittedAt - a.submittedAt)[0]

    if (!latest?.txHash) return

    setActiveCommitment({
      hash: latest.hash,
      side: latest.side,
      price: latest.price,
      amount: latest.amount,
      txHash: latest.txHash,
    })
  }, [address, activeCommitment, setActiveCommitment])
}
