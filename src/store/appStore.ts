import { create } from 'zustand'

export type OrderStatus = 'pending' | 'matched' | 'proving' | 'settled' | 'failed'

export interface ProtocolOrder {
  id: string
  pair: string
  side: 'buy' | 'sell'
  amount: string
  status: OrderStatus
  commitmentHash: string
  createdAt: string
}

interface AppState {
  isConnected: boolean
  selectedOrderId: string | null
  proofInspectorOpen: boolean
  setConnected: (connected: boolean) => void
  selectOrder: (id: string | null) => void
  setProofInspectorOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  isConnected: false,
  selectedOrderId: null,
  proofInspectorOpen: false,
  setConnected: (connected) => set({ isConnected: connected }),
  selectOrder: (id) => set({ selectedOrderId: id }),
  setProofInspectorOpen: (open) => set({ proofInspectorOpen: open }),
}))
