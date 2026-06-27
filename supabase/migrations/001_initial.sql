-- ────────────────────────────────────────────────────────────────────────────
-- ShadowPool — initial schema
-- Run via: supabase db push  OR  paste into the Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────────────────

-- ── order_secrets ────────────────────────────────────────────────────────────
-- One row per on-chain commitment.
-- The encrypted_data column holds the raw private inputs (nonce, salt, amounts)
-- encrypted with AES-256-GCM using the service's MATCHER_SECRET_KEY.
-- We store asset_amount / limit_price in plaintext for the matcher engine to
-- compute clearing prices without decrypting every row on every cycle.

create table if not exists order_secrets (
  id              uuid         primary key default gen_random_uuid(),
  commitment_hash text         unique not null,   -- bytes32  "0x…"
  encrypted_data  text         not null,          -- AES-GCM base64 blob
  trader          text         not null,          -- lowercase "0x…"
  asset_amount    text         not null,          -- wei, decimal string
  limit_price     text         not null,          -- micro-USDC, decimal string

  -- lifecycle state machine
  -- pending → matched → proving → settled
  --                   → failed  (retryable via re-running worker)
  status          text         not null default 'pending'
    check (status in ('pending', 'matched', 'proving', 'settled', 'failed')),

  submitted_at    timestamptz  not null default now(),
  matched_at      timestamptz,
  settled_at      timestamptz,
  tx_hash         text,
  error           text
);

create index if not exists order_secrets_status_idx
  on order_secrets (status);

create index if not exists order_secrets_trader_idx
  on order_secrets (trader);

create index if not exists order_secrets_submitted_idx
  on order_secrets (submitted_at desc);

-- ── match_jobs ───────────────────────────────────────────────────────────────
-- One row per matched pair.  Created by the matcher engine, consumed by the
-- prover worker.  Idempotent — re-running the worker is safe.

create table if not exists match_jobs (
  id              uuid    primary key default gen_random_uuid(),
  commitment_a    text    not null references order_secrets (commitment_hash),
  commitment_b    text    not null references order_secrets (commitment_hash),
  clearing_price  text    not null,  -- micro-USDC, decimal string

  status          text    not null default 'proving'
    check (status in ('proving', 'settled', 'failed')),

  started_at      timestamptz not null default now(),
  settled_at      timestamptz,
  tx_hash         text,
  block_number    bigint,
  error           text,

  unique (commitment_a, commitment_b)
);

create index if not exists match_jobs_status_idx
  on match_jobs (status);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- The matcher service uses the service-role key (bypasses RLS).
-- Enable RLS so the anon key cannot read secrets from the client side.

alter table order_secrets enable row level security;
alter table match_jobs    enable row level security;

-- No public policies: only the service role can read/write.
-- Add wallet-scoped read policies here if you want traders to query their own status
-- via a Supabase client directly (otherwise they should use GET /v1/status/:hash).
