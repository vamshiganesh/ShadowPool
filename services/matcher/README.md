# ShadowPool Matcher Service

A production-grade backend service that automates the full ZK dark-pool settlement
pipeline — previously a manual two-browser JSON export/merge workflow.

## Stack

| Layer | Tech | Why |
|---|---|---|
| API server | **Fastify** | 3× faster than Express, schema-validated routes, pino logging |
| Database | **Supabase** (Postgres) | Managed Postgres, Row-Level Security, SDK, Realtime ready |
| Encryption | **AES-256-GCM** | Secrets encrypted at rest; only the service key can decrypt |
| Chain watcher | **ethers.js v6** | WebSocket event subscription for `CommitmentSubmitted` |
| Prover | **snarkjs** (child process) | Groth16 proof generation; CPU-isolated from API event loop |
| Auth | **EIP-191 personal_sign** | Only the real trader can upload their own secrets |
| Container | **Docker** | Single multi-stage image covers prover + matcher |

## Architecture

```
Frontend wallet
│  submitCommitment()        ← on-chain tx
│  signMessage(upload msg)   ← EIP-191
│  POST /v1/secrets          ← encrypted secrets to this service
│
▼
Matcher Service (Fastify)
├── routes/secrets.ts        verify sig → AES-encrypt → Supabase
├── routes/status.ts         GET lifecycle for frontend stepper
│
├── chain/watcher.ts         ethers.js watchContractEvent
│   CommitmentSubmitted  ──► triggerMatch()
│
├── engine/matcher.ts        fetch pending secrets, find crossing bid/ask
│   new_pair_found  ────────► createMatchJob (Supabase)
│
└── engine/worker.ts         poll for 'proving' jobs
    decrypt A + B secrets
    │
    ▼  stdin JSON
    prover/dist/service-entry.js
    │  snarkjs fullProve()
    │  submitSettlement() on Sepolia
    └─► resolveJob (update Supabase with tx hash)
```

## Quick Start

### 1. Supabase setup

1. Create a [Supabase](https://supabase.com) project
2. Run the migration in the SQL editor:
   ```sql
   -- paste contents of supabase/migrations/001_initial.sql
   ```
3. Copy your **Project URL** and **service-role key** (Settings → API)

### 2. Configure environment

```bash
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, MATCHER_SECRET_KEY,
# SEPOLIA_RPC_URL, SEPOLIA_WS_URL, PROVER_PRIVATE_KEY
```

### 3. Build the prover

The matcher worker spawns `prover/dist/service-entry.js` as a child process.
Build it once before starting the service:

```bash
cd ../../prover && npm install && npm run build
```

### 4. Start the service

```bash
# Development (ts-node, hot reload not included — use nodemon if needed)
npm install
npm run dev

# Production
npm run build:all   # builds prover + matcher
npm start
```

The API will be available at `http://localhost:3001`.

### 5. Configure the frontend

Add to `ShadowPool/.env`:
```
VITE_MATCHER_URL=http://localhost:3001
```

## API Reference

### `POST /v1/secrets`

Called automatically by the frontend after every on-chain commitment confirmation.

**Body**

```json
{
  "commitmentHash": "0x…",
  "assetAmount":    "1000000000000000000",
  "limitPrice":     "3000000000",
  "nonce":          "42",
  "salt":           "99",
  "trader":         "0x…",
  "signature":      "0x…"
}
```

The `signature` must be an EIP-191 `personal_sign` over:
```
ShadowPool secret upload
commitment: 0x<hash>
nonce: <nonce>
```

**Response** `201 Created`
```json
{ "success": true, "status": "pending" }
```

---

### `GET /v1/status/:hash`

Polls the lifecycle stage for a commitment hash.

**Response** `200 OK`
```json
{
  "commitmentHash": "0x…",
  "status":        "proving",
  "txHash":        null,
  "matchedAt":     "2026-06-27T18:30:00.000Z",
  "settledAt":     null,
  "error":         null
}
```

`status` values: `pending → matched → proving → settled` (or `failed`)

---

### `GET /health`

```json
{ "status": "ok", "ts": "2026-06-27T18:30:00.000Z" }
```

## Deployment

### Fly.io (recommended)

```bash
fly launch --name shadowpool-matcher --region iad
fly secrets set \
  SUPABASE_URL=... \
  SUPABASE_SERVICE_KEY=... \
  MATCHER_SECRET_KEY=... \
  SEPOLIA_WS_URL=wss://eth-sepolia.g.alchemy.com/v2/... \
  PROVER_PRIVATE_KEY=0x...
fly deploy
```

Update `VITE_MATCHER_URL` in your Vercel/Netlify env to the Fly.io URL.

### Railway / Render

Both support Docker deployments — point to the `Dockerfile` in the repo root
(it copies `prover/` and `services/matcher/` in a multi-stage build).

## Security Notes

- Secrets are AES-256-GCM encrypted before storage — Supabase only sees ciphertext
- Row Level Security is enabled; the anon key cannot read the `order_secrets` table
- The `PROVER_PRIVATE_KEY` wallet only pays settlement gas — it never holds user funds
- Rotate `MATCHER_SECRET_KEY` by decrypting all rows, re-encrypting, and updating
