/**
 * Manually-maintained Supabase types.
 * For a production project, generate with: `supabase gen types typescript`
 */

export type OrderStatus =
  | 'pending'   // secret received, on-chain commitment verified
  | 'matched'   // paired with a counterparty, proof pending
  | 'proving'   // Groth16 proof generation in progress
  | 'settled'   // settlement tx confirmed on-chain
  | 'failed'    // proof or settlement error (retryable)

export type JobStatus = 'proving' | 'settled' | 'failed'

export interface OrderSecretRow {
  id: string
  commitment_hash: string
  encrypted_data: string    // AES-256-GCM blob
  trader: string            // lowercase 0x…
  asset_amount: string      // wei as decimal string
  limit_price: string       // micro-USDC as decimal string
  status: OrderStatus
  submitted_at: string
  matched_at: string | null
  settled_at: string | null
  tx_hash: string | null
  error: string | null
}

export interface MatchJobRow {
  id: string
  commitment_a: string
  commitment_b: string
  clearing_price: string    // micro-USDC as decimal string
  status: JobStatus
  started_at: string
  settled_at: string | null
  tx_hash: string | null
  block_number: number | null
  error: string | null
}

// Minimal Database shape for the typed Supabase client
export interface Database {
  public: {
    Tables: {
      order_secrets: {
        Row: OrderSecretRow
        Insert: Omit<OrderSecretRow, 'id' | 'submitted_at'>
        Update: Partial<OrderSecretRow>
      }
      match_jobs: {
        Row: MatchJobRow
        Insert: Omit<MatchJobRow, 'id' | 'started_at'>
        Update: Partial<MatchJobRow>
      }
    }
  }
}
