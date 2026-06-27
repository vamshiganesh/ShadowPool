import { createClient } from '@supabase/supabase-js'
import { env } from '../env'

/**
 * Service-role Supabase client — bypasses Row Level Security.
 * Never expose this to the browser; backend-only.
 *
 * We use the untyped client here and apply explicit row types in queries.ts
 * to avoid fighting with Supabase's generated-type generic shape.
 */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: { persistSession: false },
  },
)
