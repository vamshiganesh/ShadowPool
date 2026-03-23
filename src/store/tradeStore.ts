import { create } from 'zustand'
import type { LifecycleStageId } from '@/features/trade/data/mockLifecycle'
import { DEFAULT_ACTIVE_STAGE } from '@/features/trade/data/mockLifecycle'
import type { DepthResolution } from '@/features/trade/data/mockMarket'

export type OrderSide = 'buy' | 'sell'

interface TradeState {
  side: OrderSide
  price: string
  amount: string
  activeLifecycleStage: LifecycleStageId
  depthResolution: DepthResolution
  commitmentDrawerOpen: boolean
  proofInspectorOpen: boolean
  setSide: (side: OrderSide) => void
  setPrice: (price: string) => void
  setAmount: (amount: string) => void
  setActiveLifecycleStage: (stage: LifecycleStageId) => void
  setDepthResolution: (res: DepthResolution) => void
  openCommitmentDrawer: () => void
  closeCommitmentDrawer: () => void
  openProofInspector: () => void
  closeProofInspector: () => void
}

export const useTradeStore = create<TradeState>((set) => ({
  side: 'buy',
  price: '3,421.50',
  amount: '2.50',
  activeLifecycleStage: DEFAULT_ACTIVE_STAGE,
  depthResolution: '1',
  commitmentDrawerOpen: false,
  proofInspectorOpen: false,
  setSide: (side) => set({ side }),
  setPrice: (price) => set({ price }),
  setAmount: (amount) => set({ amount }),
  setActiveLifecycleStage: (stage) => set({ activeLifecycleStage: stage }),
  setDepthResolution: (res) => set({ depthResolution: res }),
  openCommitmentDrawer: () => set({ commitmentDrawerOpen: true }),
  closeCommitmentDrawer: () => set({ commitmentDrawerOpen: false }),
  openProofInspector: () => set({ proofInspectorOpen: true }),
  closeProofInspector: () => set({ proofInspectorOpen: false }),
}))
