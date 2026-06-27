import { create } from 'zustand'
import type { ChainCommitment, ChainSettlement, ProtocolStats } from '@/lib/protocol/types'

interface ProtocolEventState {
  isListening: boolean
  isBootstrapped: boolean
  bootstrapError: string | null
  commitments: Map<string, ChainCommitment>
  settlements: ChainSettlement[]
  latestBlock: bigint | null
  setListening: (v: boolean) => void
  setBootstrapped: (v: boolean) => void
  setBootstrapError: (error: string | null) => void
  upsertCommitment: (c: ChainCommitment) => void
  addSettlement: (s: ChainSettlement) => void
  setLatestBlock: (block: bigint) => void
  hydrate: (commitments: ChainCommitment[], settlements: ChainSettlement[]) => void
  reset: () => void
}

const emptyStats = (): ProtocolStats => ({
  totalCommitments: 0,
  openCommitments: 0,
  totalSettlements: 0,
  totalVolumeEth: 0,
  settlementRate: 0,
  latestClearingPrice: null,
  latestBlock: null,
})

export function selectProtocolStats(state: ProtocolEventState): ProtocolStats {
  const commitments = [...state.commitments.values()]
  const settled = commitments.filter((c) => c.status === 'settled').length
  const open = commitments.filter((c) => c.status === 'onchain').length
  const total = commitments.length

  let volumeEth = 0
  for (const s of state.settlements) {
    const a = s.escrowA ?? 0n
    const b = s.escrowB ?? 0n
    volumeEth += Number(a + b) / 1e18
  }
  if (volumeEth === 0) {
    for (const c of commitments.filter((x) => x.status === 'settled')) {
      volumeEth += Number(c.escrowWei) / 1e18
    }
  }

  const latestSettlement = state.settlements[0]
  const latestClearingPrice = latestSettlement
    ? Number(latestSettlement.clearingPrice) / 1e6
    : null

  const settlementCount = Math.max(
    state.settlements.length,
    settled >= 2 ? Math.floor(settled / 2) : 0,
  )

  return {
    totalCommitments: total,
    openCommitments: open,
    totalSettlements: settlementCount,
    totalVolumeEth: volumeEth,
    settlementRate: total > 0 ? (settled / total) * 100 : 0,
    latestClearingPrice,
    latestBlock: state.latestBlock,
  }
}

export const useProtocolEventStore = create<ProtocolEventState>((set) => ({
  isListening: false,
  isBootstrapped: false,
  bootstrapError: null,
  commitments: new Map(),
  settlements: [],
  latestBlock: null,

  setListening: (v) => set({ isListening: v }),
  setBootstrapped: (v) => set({ isBootstrapped: v }),
  setBootstrapError: (error) => set({ bootstrapError: error }),

  upsertCommitment: (c) =>
    set((state) => {
      const next = new Map(state.commitments)
      next.set(c.hash.toLowerCase(), c)
      return { commitments: next }
    }),

  addSettlement: (s) =>
    set((state) => {
      if (state.settlements.some((x) => x.id === s.id)) return state
      return { settlements: [s, ...state.settlements].slice(0, 200) }
    }),

  setLatestBlock: (block) => set({ latestBlock: block }),

  hydrate: (commitments, settlements) =>
    set(() => {
      const map = new Map<string, ChainCommitment>()
      for (const c of commitments) map.set(c.hash.toLowerCase(), c)
      const sorted = [...settlements].sort((a, b) =>
        a.blockNumber > b.blockNumber ? -1 : 1,
      )
      return { commitments: map, settlements: sorted }
    }),

  reset: () =>
    set({
      isListening: false,
      isBootstrapped: false,
      bootstrapError: null,
      commitments: new Map(),
      settlements: [],
      latestBlock: null,
    }),
}))

export { emptyStats }
