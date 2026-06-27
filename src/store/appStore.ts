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
  selectedOrderId: string | null
  selectOrder: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedOrderId: null,
  selectOrder: (id) => set({ selectedOrderId: id }),
}))
