import { useEffect, useMemo, useRef, useState } from 'react'
import { BUY_DEPTH, SELL_DEPTH, MARKET_PAIR } from '@/features/trade/data/mockMarket'
import type { DepthResolution } from '@/features/trade/data/mockMarket'
import { useTradeStore } from '@/store/tradeStore'
import { useProtocolStats } from './useProtocolData'

interface DepthLevel {
  price: number
  size: number
}

function resolutionStep(res: DepthResolution): number {
  return parseFloat(res)
}

function buildDepthFromTemplate(
  template: DepthLevel[],
  midPrice: number,
  side: 'buy' | 'sell',
  step: number,
): DepthLevel[] {
  return template.map((level, i) => {
    const offset = (i + 1) * step * (side === 'buy' ? -1 : 1)
    return {
      price: Math.round((midPrice + offset) * 100) / 100,
      size: level.size,
    }
  })
}

function perturbLevels(
  levels: DepthLevel[],
  midPrice: number,
  side: 'buy' | 'sell',
  step: number,
): DepthLevel[] {
  return levels.map((level, i) => {
    const drift = 0.85 + Math.random() * 0.3
    const size = Math.max(5, level.size * drift)
    const offset = (i + 1) * step * (side === 'buy' ? -1 : 1)
    return { price: Math.round((midPrice + offset) * 100) / 100, size: Math.round(size * 10) / 10 }
  })
}

/**
 * Hybrid market data: mid price tracks latest on-chain clearing price when live,
 * with gently drifting depth book every ~6s. Depth resolution controls price tick spacing.
 */
export function useMarketData() {
  const stats = useProtocolStats()
  const depthResolution = useTradeStore((s) => s.depthResolution)
  const step = resolutionStep(depthResolution)
  const baseMid = stats.latestClearingPrice ?? MARKET_PAIR.lastPrice
  const [midPrice, setMidPrice] = useState(baseMid)
  const [buyDepth, setBuyDepth] = useState<DepthLevel[]>(() =>
    buildDepthFromTemplate(BUY_DEPTH, baseMid, 'buy', step),
  )
  const [sellDepth, setSellDepth] = useState<DepthLevel[]>(() =>
    buildDepthFromTemplate(SELL_DEPTH, baseMid, 'sell', step),
  )
  const prevClearing = useRef(baseMid)
  const prevStep = useRef(step)

  // Rebuild book when resolution changes.
  useEffect(() => {
    if (prevStep.current === step) return
    prevStep.current = step
    setBuyDepth(buildDepthFromTemplate(BUY_DEPTH, midPrice, 'buy', step))
    setSellDepth(buildDepthFromTemplate(SELL_DEPTH, midPrice, 'sell', step))
  }, [step, midPrice])

  useEffect(() => {
    if (stats.latestClearingPrice && stats.latestClearingPrice !== prevClearing.current) {
      prevClearing.current = stats.latestClearingPrice
      setMidPrice(stats.latestClearingPrice)
      setBuyDepth(buildDepthFromTemplate(BUY_DEPTH, stats.latestClearingPrice, 'buy', step))
      setSellDepth(buildDepthFromTemplate(SELL_DEPTH, stats.latestClearingPrice, 'sell', step))
    }
  }, [stats.latestClearingPrice, step])

  useEffect(() => {
    const id = setInterval(() => {
      setMidPrice((p: number) => {
        const nudge = (Math.random() - 0.5) * step * 0.12
        return Math.round((p + nudge) * 100) / 100
      })
      setBuyDepth((prev) => perturbLevels(prev, midPrice, 'buy', step))
      setSellDepth((prev) => perturbLevels(prev, midPrice, 'sell', step))
    }, 6000)
    return () => clearInterval(id)
  }, [midPrice, step])

  const market = useMemo(
    () => ({
      ...MARKET_PAIR,
      lastPrice: midPrice,
      change24h: MARKET_PAIR.change24h,
    }),
    [midPrice],
  )

  return { market, buyDepth, sellDepth, isLive: stats.isLive, depthResolution }
}
