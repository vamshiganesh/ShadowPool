import { useEffect, useRef, useState } from 'react'
import {
  computeCommitment,
  generateNonce,
  generateSalt,
  type OrderInput,
} from './commitment'

interface CommitmentState {
  hash: string | null
  isComputing: boolean
  error: string | null
  nonce: bigint
  salt: bigint
}

function parseDecimalInput(value: string): number | null {
  const cleaned = value.replace(/,/g, '').trim()
  if (!cleaned) return null
  const num = parseFloat(cleaned)
  return Number.isFinite(num) && num > 0 ? num : null
}

/**
 * React hook that computes a Poseidon commitment in real-time as the user types.
 * Drives the animated commitment hash in the order entry form.
 */
export function useCommitment(assetAmount: string, limitPrice: string) {
  const [state, setState] = useState<CommitmentState>(() => ({
    hash: null,
    isComputing: false,
    error: null,
    nonce: generateNonce(),
    salt: generateSalt(),
  }))

  const nonceRef = useRef(state.nonce)
  const saltRef = useRef(state.salt)

  useEffect(() => {
    const amountNum = parseDecimalInput(assetAmount)
    const priceNum = parseDecimalInput(limitPrice)

    if (amountNum === null || priceNum === null) {
      setState((s) => ({ ...s, hash: null, error: null, isComputing: false }))
      return
    }

    let cancelled = false
    setState((s) => ({ ...s, isComputing: true, error: null }))

    const compute = async () => {
      try {
        const order: OrderInput = {
          assetAmount: BigInt(Math.round(amountNum * 1e18)),
          limitPrice: BigInt(Math.round(priceNum * 1e6)),
          nonce: nonceRef.current,
          salt: saltRef.current,
        }

        const hash = await computeCommitment(order)
        if (!cancelled) {
          setState((s) => ({ ...s, hash, isComputing: false }))
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            hash: null,
            isComputing: false,
            error: 'Commitment computation failed',
          }))
        }
      }
    }

    const debounce = setTimeout(compute, 300)
    return () => {
      cancelled = true
      clearTimeout(debounce)
    }
  }, [assetAmount, limitPrice])

  return state
}
