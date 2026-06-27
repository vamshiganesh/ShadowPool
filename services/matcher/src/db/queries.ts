import { supabase } from './client'
import { encrypt, decrypt } from '../crypto/aes'
import { env } from '../env'
import type { OrderStatus, MatchJobRow } from './database.types'

// ── Secret payload (plaintext after decryption) ─────────────────────────────

export interface SecretPayload {
  commitmentHash: string
  assetAmount: string      // wei decimal string
  limitPrice: string       // micro-USDC decimal string
  nonce: string
  salt: string
  trader: string
}

// ── Order secrets ────────────────────────────────────────────────────────────

export async function upsertOrderSecret(payload: SecretPayload): Promise<void> {
  const encrypted_data = encrypt(JSON.stringify(payload), env.MATCHER_SECRET_KEY)

  const { error } = await supabase
    .from('order_secrets')
    .upsert(
      {
        commitment_hash: payload.commitmentHash.toLowerCase(),
        encrypted_data,
        trader: payload.trader.toLowerCase(),
        asset_amount: payload.assetAmount,
        limit_price: payload.limitPrice,
        status: 'pending',
        matched_at: null,
        settled_at: null,
        tx_hash: null,
        error: null,
      } as Record<string, unknown>,
      { onConflict: 'commitment_hash' },
    )

  if (error) throw new Error(`[db] upsertOrderSecret: ${error.message}`)
}

interface EncryptedRow { encrypted_data: string }
interface StatusRow {
  status: OrderStatus
  tx_hash: string | null
  matched_at: string | null
  settled_at: string | null
  error: string | null
}

export async function getPendingSecrets(): Promise<SecretPayload[]> {
  const { data, error } = await supabase
    .from('order_secrets')
    .select('encrypted_data')
    .in('status', ['pending', 'failed'])
    .order('submitted_at', { ascending: true })
    .limit(100)
    .returns<EncryptedRow[]>()

  if (error) throw new Error(`[db] getPendingSecrets: ${error.message}`)
  if (!data) return []

  return data.map((row) => {
    const plain = decrypt(row.encrypted_data, env.MATCHER_SECRET_KEY)
    return JSON.parse(plain) as SecretPayload
  })
}

export async function getSecretByHash(hash: string): Promise<SecretPayload | null> {
  const { data, error } = await supabase
    .from('order_secrets')
    .select('encrypted_data')
    .eq('commitment_hash', hash.toLowerCase())
    .single()
    .returns<EncryptedRow>()

  if (error || !data) return null

  const plain = decrypt((data as EncryptedRow).encrypted_data, env.MATCHER_SECRET_KEY)
  return JSON.parse(plain) as SecretPayload
}

export async function getOrderStatus(hash: string): Promise<StatusRow | null> {
  const { data, error } = await supabase
    .from('order_secrets')
    .select('status, tx_hash, matched_at, settled_at, error')
    .eq('commitment_hash', hash.toLowerCase())
    .single()
    .returns<StatusRow>()

  if (error || !data) return null
  return data as StatusRow
}

export async function setOrderStatus(
  hash: string,
  status: OrderStatus,
  extras: Partial<{ matched_at: string | null; settled_at: string | null; tx_hash: string | null; error: string | null }> = {},
): Promise<void> {
  const { error } = await supabase
    .from('order_secrets')
    .update({ status, ...extras } as Record<string, unknown>)
    .eq('commitment_hash', hash.toLowerCase())

  if (error) throw new Error(`[db] setOrderStatus(${hash}): ${error.message}`)
}

// ── Match jobs ───────────────────────────────────────────────────────────────

export async function createMatchJob(
  commitmentA: string,
  commitmentB: string,
  clearingPrice: bigint,
): Promise<void> {
  const { error } = await supabase
    .from('match_jobs')
    .upsert(
      {
        commitment_a: commitmentA.toLowerCase(),
        commitment_b: commitmentB.toLowerCase(),
        clearing_price: clearingPrice.toString(),
        status: 'proving',
        settled_at: null,
        tx_hash: null,
        block_number: null,
        error: null,
      } as Record<string, unknown>,
      { onConflict: 'commitment_a,commitment_b', ignoreDuplicates: true },
    )

  if (error) throw new Error(`[db] createMatchJob: ${error.message}`)
}

export async function getPendingJobs(): Promise<MatchJobRow[]> {
  const { data, error } = await supabase
    .from('match_jobs')
    .select('*')
    .in('status', ['proving', 'failed'])
    .order('started_at', { ascending: true })
    .returns<MatchJobRow[]>()

  if (error) throw new Error(`[db] getPendingJobs: ${error.message}`)
  return (data ?? []) as MatchJobRow[]
}

export async function resolveJob(
  jobId: string,
  txHash: string,
  blockNumber: number,
  commitmentA: string,
  commitmentB: string,
): Promise<void> {
  const now = new Date().toISOString()

  await Promise.all([
    supabase.from('match_jobs').update({
      status: 'settled',
      tx_hash: txHash,
      block_number: blockNumber,
      settled_at: now,
      error: null,
    } as Record<string, unknown>).eq('id', jobId),

    setOrderStatus(commitmentA, 'settled', { settled_at: now, tx_hash: txHash }),
    setOrderStatus(commitmentB, 'settled', { settled_at: now, tx_hash: txHash }),
  ])
}

export async function failJob(jobId: string, message: string): Promise<void> {
  await supabase.from('match_jobs').update({
    status: 'failed',
    error: message,
  } as Record<string, unknown>).eq('id', jobId)
}
