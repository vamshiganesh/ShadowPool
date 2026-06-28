import { useMemo } from 'react'
import { useAccount, useBlockNumber } from 'wagmi'
import { useProtocolEventStore, selectProtocolStats } from '@/store/protocolEventStore'
import { areContractsDeployed } from '@/lib/contracts/addresses'
import { MOCK_SETTLEMENTS } from '@/features/trade/data/mockSettlements'
import { MOCK_ORDERS, type OrderFilterTab, type OrderRow } from '@/features/orders/data/mockOrders'
import { loadLocalCommitments } from '@/lib/protocol/localCommitments'
import {
  formatClearingPrice,
  formatEthAmount,
  formatTimeFromTimestamp,
  truncateHash,
} from '@/lib/protocol/format'
import type { SettlementFeedRow, OrderRowFromChain } from '@/lib/protocol/types'
import { PROTOCOL } from '@/lib/constants/protocol'

export function useIsChainLive(): boolean {
  const bootstrapped = useProtocolEventStore((s) => s.isBootstrapped)
  return areContractsDeployed() && bootstrapped
}

export function useProtocolStats() {
  const store = useProtocolEventStore()
  const isLive = useIsChainLive()
  const chainStats = useMemo(() => selectProtocolStats(store), [store])

  if (!isLive) {
    return {
      isLive: false,
      totalCommitments: 14892,
      openCommitments: 1847,
      totalSettlements: 8204,
      totalVolumeEth: 2405.18,
      settlementRate: 99.8,
      latestClearingPrice: 3421.5,
      latestBlock: BigInt(PROTOCOL.blockHeight),
    }
  }

  return { isLive: true, ...chainStats }
}

export function useSettlementFeed(): { rows: SettlementFeedRow[]; isLive: boolean } {
  const commitments = useProtocolEventStore((s) => s.commitments)
  const settlements = useProtocolEventStore((s) => s.settlements)
  const isLive = useIsChainLive()

  return useMemo(() => {
    if (!isLive) {
      return {
        rows: MOCK_SETTLEMENTS.map((r) => ({
          ...r,
          txHashFull: `0x${'0'.repeat(64)}` as `0x${string}`,
        })),
        isLive: false,
      }
    }

    const rows: SettlementFeedRow[] = []

    for (const s of settlements) {
      const amountWei = (s.escrowA ?? 0n) + (s.escrowB ?? 0n)
      const half = amountWei / 2n
      rows.push({
        id: s.id,
        time: s.blockTimestamp
          ? formatTimeFromTimestamp(s.blockTimestamp)
          : '—',
        pair: 'ETH/USDC',
        price: formatClearingPrice(s.clearingPrice),
        amount: formatEthAmount(half > 0n ? half : 1n),
        status: 'SETTLED',
        txHash: truncateHash(s.txHash),
        txHashFull: s.txHash,
      })
    }

    const settledFromEvents = new Set<string>()
    for (const s of settlements) {
      settledFromEvents.add(s.commitmentA.toLowerCase())
      settledFromEvents.add(s.commitmentB.toLowerCase())
    }

    for (const c of commitments.values()) {
      if (c.status !== 'settled' || settledFromEvents.has(c.hash.toLowerCase())) continue
      rows.push({
        id: c.hash,
        time: c.blockTimestamp ? formatTimeFromTimestamp(c.blockTimestamp) : '—',
        pair: 'ETH/USDC',
        price: '—',
        amount: formatEthAmount(c.escrowWei > 0n ? c.escrowWei : 1n),
        status: 'SETTLED',
        txHash: truncateHash(c.txHash),
        txHashFull: c.txHash,
        commitmentHash: c.hash,
      })
      settledFromEvents.add(c.hash.toLowerCase())
    }

    const settledHashes = settledFromEvents

    const open = [...commitments.values()]
      .filter((c) => c.status === 'onchain' && !settledHashes.has(c.hash.toLowerCase()))
      .sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1))

    for (const c of open) {
      rows.push({
        id: c.hash,
        time: c.blockTimestamp ? formatTimeFromTimestamp(c.blockTimestamp) : '—',
        pair: 'ETH/USDC',
        price: '—',
        amount: formatEthAmount(c.escrowWei),
        status: 'ON-CHAIN',
        txHash: truncateHash(c.txHash),
        txHashFull: c.txHash,
        commitmentHash: c.hash,
      })
    }

    const local = loadLocalCommitments()
    const indexedHashes = new Set(rows.map((r) => r.commitmentHash?.toLowerCase()).filter(Boolean))
    const settledLocal = new Set<string>()
    for (const s of settlements) {
      settledLocal.add(s.commitmentA.toLowerCase())
      settledLocal.add(s.commitmentB.toLowerCase())
    }
    for (const meta of local) {
      if (!meta.txHash || indexedHashes.has(meta.hash.toLowerCase())) continue
      if (settledLocal.has(meta.hash.toLowerCase())) continue
      rows.push({
        id: meta.hash,
        time: meta.submittedAt ? formatTimeFromTimestamp(meta.submittedAt) : '—',
        pair: 'ETH/USDC',
        price: meta.price,
        amount: meta.amount,
        status: 'ON-CHAIN',
        txHash: truncateHash(meta.txHash),
        txHashFull: meta.txHash,
        commitmentHash: meta.hash,
      })
    }

    return { rows: rows.slice(0, 12), isLive: true }
  }, [commitments, settlements, isLive])
}

export function useProtocolTickerItems() {
  const stats = useProtocolStats()
  const feed = useSettlementFeed()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const isLive = useIsChainLive()

  return useMemo(() => {
    const block = isLive && blockNumber ? blockNumber.toString() : PROTOCOL.blockHeight.toLocaleString()
    const latestTx = feed.rows[0]?.txHash ?? '0x7a3f…e91c'

    if (!isLive) {
      return [
        { label: '24h Volume', value: '$12.4M' },
        { label: 'Active Commitments', value: '1,847' },
        { label: 'Proofs Generated', value: '3,291' },
        { label: 'Settlement Rate', value: '99.7%' },
        { label: 'Avg Proof Time', value: PROTOCOL.avgProofTime },
        { label: 'Block', value: `#${block}` },
      ]
    }

    return [
      {
        label: 'Open Commitments',
        value: stats.openCommitments.toLocaleString(),
      },
      {
        label: 'Total Settlements',
        value: stats.totalSettlements.toLocaleString(),
      },
      {
        label: 'Volume (ETH)',
        value: stats.totalVolumeEth.toFixed(2),
      },
      {
        label: 'Settlement Rate',
        value: `${stats.settlementRate.toFixed(1)}%`,
      },
      {
        label: 'Last Price',
        value: stats.latestClearingPrice
          ? `$${stats.latestClearingPrice.toFixed(2)}`
          : '—',
      },
      { label: 'Block', value: `#${block}` },
      { label: 'Latest Tx', value: latestTx },
    ]
  }, [stats, feed.rows, blockNumber, isLive])
}

export function useLandingTickerItems() {
  const feed = useSettlementFeed()
  const stats = useProtocolStats()
  const isLive = useIsChainLive()

  return useMemo(() => {
    if (!isLive) return null

    const items = []
    const latest = feed.rows[0]
    if (latest) {
      items.push({
        type: 'SETTLEMENT',
        value: latest.txHash,
        status: latest.status,
      })
    }
    items.push({
      type: 'BLOCK',
      value: stats.latestBlock?.toLocaleString() ?? '—',
      status: 'CONFIRMED',
    })
    items.push({
      type: 'COMMITMENTS',
      value: stats.openCommitments.toString(),
      status: 'OPEN',
    })
    if (stats.latestClearingPrice) {
      items.push({
        type: 'CLEARING',
        value: `$${stats.latestClearingPrice.toFixed(2)}`,
        status: 'VALID',
      })
    }
    return items
  }, [feed.rows, stats, isLive])
}

function formatEthSize(amount: number): string {
  if (amount === 0) return '0'
  if (amount < 0.000_000_1) return amount.toExponential(4)
  if (amount < 0.0001) return amount.toFixed(10).replace(/0+$/, '').replace(/\.$/, '')
  if (amount < 1) return amount.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
  return amount.toFixed(4)
}

function mapChainStatusToProof(
  status: 'onchain' | 'settled' | 'cancelled',
): OrderRow['proofStatus'] {
  if (status === 'settled') return 'settled'
  if (status === 'cancelled') return 'failed'
  return 'pending'
}

export function useOrdersData(filter: OrderFilterTab) {
  const commitments = useProtocolEventStore((s) => s.commitments)
  const settlements = useProtocolEventStore((s) => s.settlements)
  const isLive = useIsChainLive()
  const { address } = useAccount()

  return useMemo(() => {
    if (!isLive) {
      const filtered = filter === 'all'
        ? MOCK_ORDERS
        : MOCK_ORDERS.filter((o) => {
            if (filter === 'pending') return o.proofStatus === 'pending'
            if (filter === 'proving') return o.proofStatus === 'proving'
            if (filter === 'settled') return o.proofStatus === 'settled'
            return true
          })
      return {
        isLive: false,
        orders: filtered,
        filterCounts: {
          all: MOCK_ORDERS.length,
          pending: MOCK_ORDERS.filter((o) => o.proofStatus === 'pending').length,
          proving: MOCK_ORDERS.filter((o) => o.proofStatus === 'proving').length,
          settled: MOCK_ORDERS.filter((o) => o.proofStatus === 'settled').length,
        },
        summary: {
          totalOrders: 24,
          totalVolume: '847.3 ETH',
          avgProofTime: '8.2s',
          settlementRate: '100%',
        },
      }
    }

    const local = loadLocalCommitments()
    const wallet = address?.toLowerCase()

    const settlementByHash = new Map<string, (typeof settlements)[0]>()
    for (const s of settlements) {
      settlementByHash.set(s.commitmentA.toLowerCase(), s)
      settlementByHash.set(s.commitmentB.toLowerCase(), s)
    }

    const chainOrders: OrderRowFromChain[] = [...commitments.values()]
      .filter((c) => !wallet || c.trader.toLowerCase() === wallet)
      .map((c) => {
        const meta = local.find((l) => l.hash.toLowerCase() === c.hash.toLowerCase())
        const matchedSettlement = settlementByHash.get(c.hash.toLowerCase())
        const status = matchedSettlement ? 'settled' as const : c.status
        const sizeFromMeta = meta?.amount
          ? formatEthSize(parseFloat(meta.amount.replace(/,/g, '')))
          : formatEthSize(Number(c.escrowWei) / 1e18)
        return {
          id: `ORD-${c.hash.slice(2, 8).toUpperCase()}`,
          type: meta?.side ?? 'buy',
          pair: 'ETH/USDC',
          size: sizeFromMeta,
          price: meta?.price ?? '—',
          submitted: c.blockTimestamp
            ? formatTimeFromTimestamp(c.blockTimestamp)
            : meta?.submittedAt
              ? formatTimeFromTimestamp(meta.submittedAt)
              : '—',
          proofStatus: mapChainStatusToProof(status),
          settlementTx: matchedSettlement
            ? truncateHash(matchedSettlement.txHash)
            : c.status === 'settled'
              ? truncateHash(c.txHash)
              : null,
          settlementTxFull: matchedSettlement
            ? matchedSettlement.txHash
            : c.status === 'settled'
              ? c.txHash
              : null,
          commitmentHash: c.hash,
        }
      })

    const seen = new Set(chainOrders.map((o) => o.commitmentHash?.toLowerCase()))
    for (const meta of local) {
      if (wallet && meta.trader?.toLowerCase() !== wallet) continue
      if (seen.has(meta.hash.toLowerCase())) continue
      const matchedSettlement = settlementByHash.get(meta.hash.toLowerCase())
      chainOrders.push({
        id: `ORD-${meta.hash.slice(2, 8).toUpperCase()}`,
        type: meta.side,
        pair: 'ETH/USDC',
        size: formatEthSize(parseFloat(meta.amount.replace(/,/g, ''))),
        price: meta.price,
        submitted: meta.submittedAt
          ? formatTimeFromTimestamp(meta.submittedAt)
          : '—',
        proofStatus: matchedSettlement ? 'settled' : 'pending',
        settlementTx: matchedSettlement ? truncateHash(matchedSettlement.txHash) : null,
        settlementTxFull: matchedSettlement?.txHash ?? null,
        commitmentHash: meta.hash,
      })
      seen.add(meta.hash.toLowerCase())
    }

    const all = (chainOrders as OrderRow[]).sort((a, b) => (a.submitted > b.submitted ? -1 : 1))
    const filtered =
      filter === 'all'
        ? all
        : all.filter((o) => {
            if (filter === 'pending') return o.proofStatus === 'pending'
            if (filter === 'proving') return o.proofStatus === 'proving'
            if (filter === 'settled') return o.proofStatus === 'settled'
            return true
          })

    const volumeEth = all.reduce((sum, o) => {
      const meta = local.find((l) => l.hash.toLowerCase() === o.commitmentHash?.toLowerCase())
      if (meta?.amount) {
        return sum + parseFloat(meta.amount.replace(/,/g, ''))
      }
      const chain = [...commitments.values()].find(
        (c) => c.hash.toLowerCase() === o.commitmentHash?.toLowerCase(),
      )
      return sum + (chain ? Number(chain.escrowWei) / 1e18 : 0)
    }, 0)

    const settled = all.filter((o) => o.proofStatus === 'settled').length

    return {
      isLive: true,
      orders: filtered,
      filterCounts: {
        all: all.length,
        pending: all.filter((o) => o.proofStatus === 'pending').length,
        proving: all.filter((o) => o.proofStatus === 'proving').length,
        settled: all.filter((o) => o.proofStatus === 'settled').length,
      },
      summary: {
        totalOrders: all.length,
        totalVolume: `${volumeEth.toFixed(2)} ETH`,
        avgProofTime: PROTOCOL.avgProofTime,
        settlementRate: all.length > 0 ? `${((settled / all.length) * 100).toFixed(0)}%` : '—',
      },
    }
  }, [commitments, settlements, isLive, address, filter])
}

export function useStatsKpis() {
  const stats = useProtocolStats()
  const isLive = useIsChainLive()

  if (!isLive) {
    return [
      { label: 'Total Volume', value: '2,405.18 ETH', trend: '+12.4%', trendLabel: 'vs last 7D', trendUp: true },
      { label: 'Total Orders', value: '14,892', trend: '+5.2%', trendLabel: 'vs last 7D', trendUp: true },
      { label: 'Proofs Generated', value: '8,204', trend: null, trendLabel: null, trendUp: null },
      { label: 'Avg Proof Time', value: '1.24s', trend: '0.1s', trendLabel: 'improvement', trendUp: true },
      { label: 'Settlement Rate', value: '99.8%', progress: 99.8, trend: null, trendLabel: null, trendUp: null },
    ]
  }

  return [
    {
      label: 'Total Volume',
      value: `${stats.totalVolumeEth.toFixed(2)} ETH`,
      trend: null,
      trendLabel: 'on-chain',
      trendUp: true,
    },
    {
      label: 'Total Commitments',
      value: stats.totalCommitments.toLocaleString(),
      trend: null,
      trendLabel: 'indexed',
      trendUp: true,
    },
    {
      label: 'Settlements',
      value: stats.totalSettlements.toLocaleString(),
      trend: null,
      trendLabel: 'verified',
      trendUp: null,
    },
    {
      label: 'Open Commitments',
      value: stats.openCommitments.toLocaleString(),
      trend: null,
      trendLabel: 'live',
      trendUp: null,
    },
    {
      label: 'Settlement Rate',
      value: `${stats.settlementRate.toFixed(1)}%`,
      progress: stats.settlementRate,
      trend: null,
      trendLabel: null,
      trendUp: null,
    },
  ]
}

export function useRecentSettlementsForStats() {
  const feed = useSettlementFeed()
  const isLive = useIsChainLive()

  return useMemo(() => {
    if (!isLive) return null
    return feed.rows
      .filter((r) => r.status === 'SETTLED')
      .slice(0, 5)
      .map((r) => ({
        txHash: r.txHash,
        size: r.amount,
        proofTime: '—',
        status: 'settled' as const,
      }))
  }, [feed.rows, isLive])
}
