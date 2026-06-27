import type { LocalCommitmentMeta } from './types'

const STORAGE_KEY = 'shadowpool:local-commitments'

export function loadLocalCommitments(): LocalCommitmentMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalCommitmentMeta[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalCommitment(meta: LocalCommitmentMeta): void {
  const existing = loadLocalCommitments()
  const idx = existing.findIndex((c) => c.hash.toLowerCase() === meta.hash.toLowerCase())
  const next = idx >= 0 ? existing.map((c, i) => (i === idx ? { ...c, ...meta } : c)) : [meta, ...existing]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 50)))
}

export function getLocalCommitment(hash: string): LocalCommitmentMeta | undefined {
  return loadLocalCommitments().find((c) => c.hash.toLowerCase() === hash.toLowerCase())
}

function parseAmountWei(amount: string): bigint {
  const cleaned = amount.replace(/,/g, '').trim()
  if (!cleaned) return 0n
  const parts = cleaned.split('.')
  const whole = parts[0] || '0'
  const frac = (parts[1] ?? '').padEnd(18, '0').slice(0, 18)
  return BigInt(whole) * 10n ** 18n + BigInt(frac || '0')
}

function parsePriceMicro(price: string): bigint {
  const cleaned = price.replace(/,/g, '').trim()
  if (!cleaned) return 0n
  const parts = cleaned.split('.')
  const whole = parts[0] || '0'
  const frac = (parts[1] ?? '').padEnd(6, '0').slice(0, 6)
  return BigInt(whole) * 1_000_000n + BigInt(frac || '0')
}

/** Export format consumed by `npm run prove:live` (prover/orders.pool.json). */
export function buildProverPoolExport(): object[] {
  return loadLocalCommitments()
    .filter((m) => m.nonce && m.salt && m.trader)
    .map((m) => ({
      commitmentHash: m.hash,
      assetAmount: parseAmountWei(m.amount).toString(),
      limitPrice: parsePriceMicro(m.price).toString(),
      nonce: m.nonce!,
      salt: m.salt!,
      trader: m.trader!,
      escrowAmount: parseAmountWei(m.amount).toString(),
    }))
}

export function downloadProverPoolExport(): void {
  const entries = buildProverPoolExport()
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `shadowpool-orders-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
