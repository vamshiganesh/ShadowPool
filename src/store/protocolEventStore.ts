import { create } from 'zustand'
import { countSettlementEvents } from '@/features/stats/utils/statsTimeRange'
import { loadLocalCommitments } from '@/lib/protocol/localCommitments'
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
  const local = loadLocalCommitments()

  const volumeFromCommitment = (c: ChainCommitment): number => {
    if (c.escrowWei > 0n) return Number(c.escrowWei) / 1e18
    const meta = local.find((l) => l.hash.toLowerCase() === c.hash.toLowerCase())
    if (!meta?.amount) return 0
    const n = parseFloat(meta.amount.replace(/,/g, '').trim())
    return Number.isFinite(n) ? n : 0
  }

  let volumeEth = 0
  for (const s of state.settlements) {
    const onChain = Number((s.escrowA ?? 0n) + (s.escrowB ?? 0n)) / 1e18
    if (onChain > 0) {
      volumeEth += onChain
      continue
    }
    const a = local.find((l) => l.hash.toLowerCase() === s.commitmentA.toLowerCase())
    const b = local.find((l) => l.hash.toLowerCase() === s.commitmentB.toLowerCase())
    const parse = (amount?: string) => {
      if (!amount) return 0
      const n = parseFloat(amount.replace(/,/g, '').trim())
      return Number.isFinite(n) ? n : 0
    }
    volumeEth += parse(a?.amount) + parse(b?.amount)
  }
  if (volumeEth === 0) {
    for (const c of commitments.filter((x) => x.status === 'settled')) {
      volumeEth += volumeFromCommitment(c)
    }
  }

  const latestSettlement = state.settlements[0]
  const latestClearingPrice = latestSettlement
    ? Number(latestSettlement.clearingPrice) / 1e6
    : null

  const settlementCount = countSettlementEvents(state.settlements.length, settled)

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
