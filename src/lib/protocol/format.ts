import { formatEther, formatUnits } from 'viem'

export function truncateHash(hash: string, head = 6, tail = 4): string {
  if (hash.length <= head + tail + 2) return hash
  return `${hash.slice(0, head + 2)}…${hash.slice(-tail)}`
}

export function formatClearingPrice(price: bigint): string {
  const n = Number(formatUnits(price, 6))
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatEthAmount(wei: bigint, decimals = 2): string {
  const n = Number(formatEther(wei))
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatTimeFromTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatTimeFromDate(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatRelativeTime(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
