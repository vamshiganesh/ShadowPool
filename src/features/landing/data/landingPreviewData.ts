import { MARKET_PAIR, BUY_DEPTH, SELL_DEPTH } from '@/features/trade/data/mockMarket'
import { MOCK_SETTLEMENTS } from '@/features/trade/data/mockSettlements'

/** Frozen demo data for the landing terminal — never wired to live protocol hooks. */
export const LANDING_PREVIEW_MARKET = MARKET_PAIR

export const LANDING_PREVIEW_BUY_DEPTH = BUY_DEPTH

export const LANDING_PREVIEW_SELL_DEPTH = SELL_DEPTH

export const LANDING_PREVIEW_SETTLEMENT_ROWS = MOCK_SETTLEMENTS.slice(0, 3)
