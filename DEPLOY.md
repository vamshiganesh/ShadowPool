# ShadowPool setup and deployment guide

This guide walks you through running ShadowPool locally, trying a live settlement on Sepolia, and putting the frontend online. The matcher service is meant to run on your machine during development and demos. The public website on Vercel shows the full UI and live chain data. Automated matching and settlement need the matcher running somewhere the browser can reach.

If you only want to browse the app, skip to [Run the frontend](#run-the-frontend). If you want the full pipeline (commit, match, prove, settle), read the whole document in order.

## What you are running

ShadowPool has three main pieces:

1. **Frontend** (Vite + React): trading terminal, orders, stats, landing page.
2. **Matcher service** (Fastify): receives encrypted order secrets, watches Sepolia, pairs orders, runs the prover, submits settlement.
3. **Smart contracts** (already deployed on Sepolia): addresses live in `shared/addresses.json`.

The frontend talks to Sepolia for on chain events and to the matcher over HTTP for the automated settlement pipeline.

## Prerequisites

Install these before you start:

| Tool | Used for |
|------|----------|
| Node.js 20+ | Frontend, matcher, prover |
| npm | Package installs |
| MetaMask (or similar) | Wallet on Sepolia testnet |
| Sepolia ETH | Gas for commitments and settlement |
| A Supabase project | Matcher database (free tier is fine) |
| An Alchemy or Infura key | Reliable Sepolia RPC (recommended) |

Optional, only if you redeploy contracts yourself:

| Tool | Used for |
|------|----------|
| Foundry (`forge`, `cast`) | Contract deploy and tests |
| Circom + snarkjs | Circuit compile (see `circuits/`) |

## One time setup

### 1. Clone and install the frontend

```bash
git clone https://github.com/vamshiganesh/ShadowPool.git
cd ShadowPool
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Open `.env` and fill in at least:

```env
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_MATCHER_URL=http://localhost:3001
VITE_WALLETCONNECT_PROJECT_ID=your_id_from_cloud.walletconnect.com
```

`VITE_WALLETCONNECT_PROJECT_ID` is optional but helps if you use WalletConnect. Get a free project id at [cloud.walletconnect.com](https://cloud.walletconnect.com).

For the matcher you also need root level RPC and prover keys (used by `services/matcher/.env`):

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_WS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PROVER_PRIVATE_KEY=0xYOUR_PROVER_WALLET_KEY
SUBMIT_ON_CHAIN=1
```

The prover wallet pays gas when a match settles. Fund it with a small amount of Sepolia ETH.

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run the full contents of `supabase/migrations/001_initial.sql`.
3. In Settings, API tab, copy:
   * **Project URL** into `SUPABASE_URL`
   * **Secret key** (the `sb_secret_...` value, not the publishable key) into `SUPABASE_SERVICE_KEY`

### 4. Configure the matcher

```bash
cp services/matcher/.env.example services/matcher/.env
```

Edit `services/matcher/.env` with your Supabase credentials, RPC URLs, prover key, and a strong `MATCHER_SECRET_KEY` (at least 32 random characters). That key encrypts order secrets at rest.

Example:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_secret_key
MATCHER_SECRET_KEY=pick_a_long_random_string_at_least_32_chars

SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_WS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PROVER_PRIVATE_KEY=0xYOUR_PROVER_WALLET_KEY
SUBMIT_ON_CHAIN=1
```

### 5. Build the prover

The matcher spawns the prover as a child process. Build it once:

```bash
cd prover
npm install
npm run build
cd ..
```

You also need circuit artifacts under `circuits/build/` (wasm and zkey). If that folder is missing, compile the circuit first:

```bash
cd circuits && bash scripts/compile.sh && cd ..
```

## Run the frontend

From the repo root:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

You should see the landing page immediately. Open **Launch App** for the trading terminal. If contracts in `shared/addresses.json` are set (they are in this repo), the feed and stats show **Sepolia live** once your wallet and RPC are working.

## Run the matcher

Use a second terminal:

```bash
cd services/matcher
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:3001/health
```

You should get JSON with `"status":"ok"`.

Leave this running whenever you want automated match and settle. Without it, you can still submit commitments on chain, but nothing will match or settle automatically.

## Try a full settlement (two wallets)

This is the demo flow recruiters care about. You need two browsers or two MetaMask profiles, both on Sepolia.

**Matching rules (important):**

* Buy price must meet or cross sell price (e.g. buy at 3422, sell at 3421).
* **Amount must be exactly the same** on both sides (e.g. 2.5 ETH each). The matcher and the ZK circuit both require equal size.

**Wallet A (buy):**

1. Connect wallet, open **Trade**.
2. Side: **Buy**. Price: `3422`. Amount: `2.5`.
3. Click **Commit Order**.
4. Confirm the **transaction** in MetaMask (costs Sepolia ETH).
5. Confirm the **signature** popup ("ShadowPool secret upload"). This is not a second transaction. No extra gas. It authorizes uploading secrets to the matcher.

**Wallet B (sell):**

1. Same steps with **Sell**, price `3421`, amount **`2.5`** (same amount as wallet A).
2. Again confirm transaction, then signature.

Watch the lifecycle stepper move from On chain to Matched to Proof to Settled. Check **Stats** and **Orders** for the settlement row and Etherscan link.

If upload fails, read the red banner under the commit button and check matcher logs in the terminal.

## Deploy the frontend to Vercel

The frontend is a good fit for Vercel. The matcher is not: it is a long running worker with heavy Groth16 proving and large circuit files. Deploy the **frontend only**.

1. Push your repo to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Settings:
   * **Root Directory:** `./` (repo root, where `package.json` lives)
   * **Framework:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Environment variables (Production and Preview):

   | Key | Value |
   |-----|--------|
   | `VITE_SEPOLIA_RPC_URL` | Your Alchemy or Infura Sepolia HTTPS URL |
   | `VITE_WALLETCONNECT_PROJECT_ID` | Optional, from WalletConnect Cloud |

5. **Do not** set `VITE_MATCHER_URL` to `http://localhost:3001` on Vercel. Visitors cannot reach your laptop. Omit it for the public link.

6. Deploy.

**What works on the public link without the matcher:**

* Landing page, docs, full UI
* Live Sepolia indexing (feed, stats, ticker) if RPC is set
* Submitting a commitment on chain (if the visitor has Sepolia ETH)

**What needs the matcher running locally (or on a server you control):**

* Secret upload after commit
* Automatic match, prove, and settle

For interviews, run the matcher on your machine and either demo from `localhost:5173` or use a tunnel (Cloudflare Tunnel works well) if you need the deployed site to talk to your local matcher temporarily.

When running matcher locally against a Vercel frontend, set in `services/matcher/.env`:

```env
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

That allows CORS from your deployed site.

## Deploy the matcher (optional, when you have budget)

The matcher needs always on compute, WebSocket or polling to Sepolia, and enough RAM for Groth16 (roughly 1 to 2 GB). Fly.io, Render, or a small VPS are reasonable choices. Vercel is not suitable for this service.

The repo includes `services/matcher/Dockerfile`. It builds the prover and matcher in one image and expects `circuits/build/` in the build context.

Before any cloud deploy:

```bash
cd prover && npm run build && cd ..
```

See `services/matcher/README.md` for API details and Docker notes.

## Redeploy contracts (advanced)

Contracts are already deployed on Sepolia and recorded in `shared/addresses.json`. Only follow this if you are changing the circuit or redeploying your own stack.

1. Compile the circuit if needed:

```bash
cd circuits && bash scripts/compile.sh && cd ..
```

2. Regenerate the Solidity verifier from the current zkey (must match the circuit):

```bash
npx snarkjs zkey export solidityverifier \
  circuits/build/shadowpool_match_final.zkey \
  contracts/src/Verifier.sol
```

3. Build and test:

```bash
cd contracts
forge build
forge test
```

4. Deploy:

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

This updates `shared/addresses.json` with new addresses and `deployBlock`.

If the verifier and zkey do not match, settlement fails with `ProofInvalid` even when the prover logs success locally.

## Troubleshooting

### Frontend and chain

| Symptom | What to try |
|---------|-------------|
| Badge says "Demo data" | `shared/addresses.json` has zero addresses. Use the bundled file or redeploy contracts. |
| Feed empty after commit | Check `VITE_SEPOLIA_RPC_URL`, wallet on Sepolia, transaction succeeded on Etherscan. |
| "Index error" badge | Do not set `VITE_INDEXER_RPC_URL` to a slow public RPC. Use Alchemy or Infura or leave unset. |
| Slow first load on Trade or Stats | Normal on first visit; app code splits heavy wallet bundles. |
| Orders page empty | Connect the wallet that submitted. Orders also load from browser storage after refresh. |

### Matcher and settlement

| Symptom | What to try |
|---------|-------------|
| "Matcher upload failed" | Matcher not running, wrong `VITE_MATCHER_URL`, or CORS (`FRONTEND_URL` must match your frontend origin). |
| Stuck on "Waiting for counterparty" | Need a second order with the **same amount** and crossing prices. |
| Match never happens | Check matcher logs for `assetAmount mismatch`. Amounts must be identical. |
| Prover job failed | Ensure `prover/dist/` exists, `circuits/build/` present, prover wallet funded. |
| `ProofInvalid` on chain | Regenerate `Verifier.sol` from zkey and redeploy contracts. |

### Two MetaMask confirmations

After **Commit Order**, MetaMask asks twice:

1. **Transaction:** submits the commitment on chain. Costs gas.
2. **Signature:** proves you own the wallet for secret upload. No gas.

Both are required for the automated pipeline.

## What is live vs simulated in the UI

| Surface | Source |
|---------|--------|
| Settlement feed, ticker, stats KPIs, your orders | On chain events (Sepolia) |
| Contract registry on Stats | `shared/addresses.json` |
| Depth chart | Hybrid demo; mid price can track latest clearing price when available |
| Proof time distribution chart | Static placeholders until prover telemetry is wired |

## Quick reference: terminals for local dev

**Terminal 1: frontend**

```bash
cd ShadowPool
npm run dev
```

**Terminal 2: matcher**

```bash
cd ShadowPool/prover && npm run build
cd ../services/matcher
npm install
npm run dev
```

**Terminal 3: optional health check**

```bash
curl http://localhost:3001/health
```

## Need help?

Open an issue on GitHub with what you tried, your environment (local vs Vercel), and any matcher log lines or browser console errors. For architecture and API details, see `services/matcher/README.md` and the docs pages inside the app (`/docs/the-problem`).
