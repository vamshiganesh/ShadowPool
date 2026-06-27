/**
 * Typed client for the ShadowPool matcher service.
 *
 * All communication is over HTTP — no WebSocket needed on the frontend.
 * The base URL defaults to VITE_MATCHER_URL (set in .env).
 */

const BASE_URL = (import.meta.env.VITE_MATCHER_URL as string | undefined) ?? 'http://localhost:3001'

export type MatcherOrderStatus = 'pending' | 'matched' | 'proving' | 'settled' | 'failed'

export interface MatcherStatusResponse {
  commitmentHash: string
  status: MatcherOrderStatus
  txHash: string | null
  matchedAt: string | null
  settledAt: string | null
  error: string | null
}

export interface UploadSecretParams {
  commitmentHash: string
  assetAmount: string   // wei decimal string
  limitPrice: string    // micro-USDC decimal string
  nonce: string
  salt: string
  trader: string        // 0x… wallet address
  /** EIP-191 signature over the canonical upload message */
  signature: string
}

/**
 * Build the exact string the frontend must sign before calling uploadSecret.
 * Must match the server-side message in routes/secrets.ts.
 */
export function buildUploadMessage(commitmentHash: string, nonce: string): string {
  return `ShadowPool secret upload\ncommitment: ${commitmentHash}\nnonce: ${nonce}`
}

/**
 * POST /v1/secrets
 * Upload order secrets to the matcher service after on-chain commitment.
 */
export async function uploadSecret(params: UploadSecretParams): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/secrets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    throw new Error(
      `[matcherApi] uploadSecret failed ${res.status}: ${body['error'] ?? res.statusText}`,
    )
  }
}

/**
 * GET /v1/status/:hash
 * Poll the lifecycle status for a commitment.
 * Returns null if the commitment has not been uploaded to the matcher yet.
 */
export async function fetchStatus(
  commitmentHash: string,
): Promise<MatcherStatusResponse | null> {
  const res = await fetch(`${BASE_URL}/v1/status/${commitmentHash}`)

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`[matcherApi] fetchStatus failed ${res.status}`)
  }

  return res.json() as Promise<MatcherStatusResponse>
}
