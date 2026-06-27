import { config } from 'dotenv'
import { resolve } from 'path'
import { z } from 'zod'

// Load .env from repo root first, then service .env
config({ path: resolve(__dirname, '../../../.env') })
config({ path: resolve(__dirname, '../.env'), override: true })

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),

  // AES-256-GCM key material for secrets at rest
  MATCHER_SECRET_KEY: z.string().min(16),

  // Ethereum
  SEPOLIA_RPC_URL: z.string().url(),
  SEPOLIA_WS_URL: z.string().optional(),

  // Prover submitter wallet
  PROVER_PRIVATE_KEY: z.string().startsWith('0x'),
  SUBMIT_ON_CHAIN: z.string().default('1'),

  // Engine tuning
  MATCH_INTERVAL_MS: z.coerce.number().default(15_000),
  WORKER_INTERVAL_MS: z.coerce.number().default(30_000),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('[env] Missing or invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

export function isSubmitEnabled(): boolean {
  const v = env.SUBMIT_ON_CHAIN.trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}
