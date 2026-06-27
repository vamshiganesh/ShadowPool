import { create } from 'zustand'
import type { LifecycleStageId } from '@/features/trade/data/mockLifecycle'
import { DEFAULT_ACTIVE_STAGE } from '@/features/trade/data/mockLifecycle'
import type { DepthResolution } from '@/features/trade/data/mockMarket'

import type { PanelHeight, PanelWidth } from '@/components/ui/ResizablePanel'

export type OrderSide = 'buy' | 'sell'

export interface ActiveCommitment {
  hash: `0x${string}`
  side: OrderSide
  price: string
  amount: string
  txHash?: `0x${string}`
}

interface TradeState {
  side: OrderSide
  price: string
  amount: string
  activeLifecycleStage: LifecycleStageId
  activeCommitment: ActiveCommitment | null
  depthResolution: DepthResolution
  depthPanelHeight: PanelHeight
  depthPanelWidth: PanelWidth
  depthPanelMaximized: boolean
  feedPanelHeight: PanelHeight
  feedPanelWidth: PanelWidth
  feedPanelMaximized: boolean
  commitmentDrawerOpen: boolean
  proofInspectorOpen: boolean
  setSide: (side: OrderSide) => void
  setPrice: (price: string) => void
  setAmount: (amount: string) => void
  setActiveLifecycleStage: (stage: LifecycleStageId) => void
  setActiveCommitment: (commitment: ActiveCommitment | null) => void
  setDepthResolution: (res: DepthResolution) => void
  setDepthPanelHeight: (height: PanelHeight) => void
  setDepthPanelWidth: (width: PanelWidth) => void
  setDepthPanelMaximized: (maximized: boolean) => void
  setFeedPanelHeight: (height: PanelHeight) => void
  setFeedPanelWidth: (width: PanelWidth) => void
  setFeedPanelMaximized: (maximized: boolean) => void
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
  activeCommitment: null,
  depthResolution: '1',
  depthPanelHeight: 'default',
  depthPanelWidth: 'default',
  depthPanelMaximized: false,
  feedPanelHeight: 'default',
  feedPanelWidth: 'default',
  feedPanelMaximized: false,
  commitmentDrawerOpen: false,
  proofInspectorOpen: false,
  setSide: (side) => set({ side }),
  setPrice: (price) => set({ price }),
  setAmount: (amount) => set({ amount }),
  setActiveLifecycleStage: (stage) => set({ activeLifecycleStage: stage }),
  setActiveCommitment: (commitment) => set({ activeCommitment: commitment }),
  setDepthResolution: (res) => set({ depthResolution: res }),
  setDepthPanelHeight: (height) => set({ depthPanelHeight: height }),
  setDepthPanelWidth: (width) => set({ depthPanelWidth: width }),
  setDepthPanelMaximized: (maximized) => set({ depthPanelMaximized: maximized }),
  setFeedPanelHeight: (height) => set({ feedPanelHeight: height }),
  setFeedPanelWidth: (width) => set({ feedPanelWidth: width }),
  setFeedPanelMaximized: (maximized) => set({ feedPanelMaximized: maximized }),
  openCommitmentDrawer: () => set({ commitmentDrawerOpen: true }),
  closeCommitmentDrawer: () => set({ commitmentDrawerOpen: false }),
  openProofInspector: () => set({ proofInspectorOpen: true }),
  closeProofInspector: () => set({ proofInspectorOpen: false }),
}))
