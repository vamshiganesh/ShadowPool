Here’s a practical order of operations: what you can verify **now** (without contract addresses), then deploy, then run the full stack, then put it on a public URL.

---

## Big picture

ShadowPool is **five pieces**, not one command:

| Layer | Folder | Needs contract addresses? |
|---|---|---|
| ZK circuit | `circuits/` | No (local only) |
| Solidity | `contracts/` | No for tests; yes for Sepolia deploy |
| Frontend | `ShadowPool/` (root) | No for UI/hash; yes for on-chain commit |
| Prover | `prover/` | No for local demo; yes for on-chain settle |
| Watcher | `watcher/` | Yes |

You’re in good shape with `.env` filled except addresses. Run **Phase 1** first.

---

## Prerequisites (one-time)

Make sure these are installed:

- **Node.js** 18+ (you already have `npm`)
- **Foundry** (`forge`, `cast`) — [getfoundry.sh](https://getfoundry.sh)
- **Circom** 2.x — for circuit compile
- **Rust** — for watcher (`cargo`)

---

## Phase 1 — Verify everything locally (no deploy yet)

Run from `ShadowPool/` unless noted.

### 1. ZK circuit

```bash
cd circuits
bash scripts/compile.sh      # first time: downloads pot16, ~few minutes
bash scripts/test_proof.sh   # end-to-end: witness → proof → verify
```

**Success:** script ends with proof verified OK.

If `compile.sh` hasn’t been run, `prover/` will fail later (needs `circuits/build/*.wasm` and `*.zkey`).

---

### 2. Solidity contracts (fully local)

```bash
cd contracts
forge test
```

**Success:** all tests pass (including real Groth16 proof test if circuit artifacts exist).

No RPC or private keys needed for `forge test`.

---

### 3. TypeScript prover (local only)

```bash
cd prover
npm install
npm run prove:demo
```

**Success:** match found, proof generated, `Local verification OK`, skips on-chain submit.

Uses test vectors only — **does not need** `ORDER_BOOK_ADDRESS`.

---

### 4. Frontend UI + browser commitments

```bash
cd ShadowPool          # repo root (where package.json is)
npm install            # if not done
npm run dev
```

Open **http://localhost:5173**

Check:

- Trade page loads (`/app` or trade route)
- Changing **Price** / **Amount** updates the commitment hash with scramble animation
- Wallet: MetaMask on **Sepolia** (for later on-chain commit)

**Expected without deployed contracts:** UI and hashing work; **Commit Order** will fail when it tries to call `OrderBook` at the zero address in `shared/addresses.json`. That’s normal until Phase 2.

Optional build check:

```bash
npm run build
```

---

### 5. Rust watcher (build only for now)

```bash
cd watcher
cargo build --release
```

**Success:** compiles. Don’t run it yet — it needs `ORDER_BOOK_ADDRESS` and a live WebSocket.

---

## Phase 2 — Deploy contracts to Sepolia

**Before deploy:**

1. Circuit compiled (`circuits/build/` exists)
2. `Verifier.sol` generated (from zkey) — should already be in `contracts/src/Verifier.sol`
3. Deployer wallet has **Sepolia ETH** (faucet)
4. Root `.env` has `DEPLOYER_PRIVATE_KEY`, `SEPOLIA_RPC_URL`, `ETHERSCAN_API_KEY`

**Deploy:**

```bash
cd contracts

# Load env from parent .env (run from contracts/ with vars exported)
export $(grep -v '^#' ../.env | xargs)

forge script script/Deploy.s.sol:Deploy \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

**Success:**

- Contracts on Sepolia
- `shared/addresses.json` updated with real addresses

**Then update `.env`:**

```env
ORDER_BOOK_ADDRESS=0x...
SETTLEMENT_ADDRESS=0x...
VERIFIER_ADDRESS=0x...
```

(Deploy script writes `shared/addresses.json`; frontend reads that. Watcher reads `.env`, so copy addresses there too.)

---

## Phase 3 — Full integration on Sepolia

Run these in **separate terminals**.

### Terminal 1 — Frontend

```bash
cd ShadowPool
npm run dev
```

- MetaMask → Sepolia, connected account with Sepolia ETH
- Submit a commitment: **Commit Order** sends ETH escrow + commitment hash

### Terminal 2 — Watcher

```bash
cd watcher
# ensure watcher/.env OR root .env has SEPOLIA_WS_URL, ORDER_BOOK_ADDRESS, SETTLEMENT_ADDRESS
cargo run --release
```

**Success:** `EVENT:{...json...}` lines when someone submits a commitment.

### Terminal 3 — Prover (after two matching commitments on-chain)

For a quick local prove test (still no chain):

```bash
cd prover
npm run prove:demo
```

For on-chain settlement after deploy:

```bash
cd prover
# copy PROVER_PRIVATE_KEY + SEPOLIA_RPC_URL into prover/.env if needed
SUBMIT_ON_CHAIN=1 npm run prove:demo
```

Prover wallet needs Sepolia ETH for `settle()` gas.

**End-to-end flow:**

1. User A commits order (frontend)
2. User B commits matching order
3. Watcher sees both events
4. Prover matches → proves → submits `settle()`
5. Escrow released on-chain

*(v1 wiring: watcher prints JSON; prover demo uses hardcoded test orders — full watcher→prover pipe may need Part 15/16 integration. Local prove + deploy + single commit still validates the stack.)*

---

## Phase 4 — Public link (anyone can access)

### Frontend only (most common for demos)

```bash
cd ShadowPool
npm run build    # outputs dist/
```

Deploy `dist/` to:

- **Vercel** / **Netlify** / **Cloudflare Pages** (connect GitHub repo, root = `ShadowPool`, build = `npm run build`, output = `dist`)

**Set env on the host:**

```env
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

Redeploy after adding it. Users need MetaMask on Sepolia.

`shared/addresses.json` is bundled at build time — **rebuild and redeploy** after contract deploy so addresses are current.

### Backend (watcher + prover)

These are **long-running processes**, not static sites:

- Run on a VPS, Railway, Fly.io, etc.
- Need `SEPOLIA_WS_URL`, keys, contract addresses
- Watcher and prover must stay online for automatic settlement

For a **UI-only public demo**, deploying the frontend is enough; users commit on Sepolia manually.

---

## Quick checklist

| Step | Command | Works without addresses? |
|---|---|---|
| Circuit compile + test | `circuits/scripts/compile.sh` + `test_proof.sh` | ✅ |
| Contract tests | `forge test` | ✅ |
| Prover demo | `prover/npm run prove:demo` | ✅ |
| Frontend dev | `npm run dev` | ✅ (hash yes, commit no) |
| Watcher run | `cargo run` | ❌ |
| Deploy contracts | `forge script ... --broadcast` | ❌ (needs keys + ETH) |
| On-chain commit | Frontend + MetaMask | ❌ |
| Public URL | `npm run build` → Vercel/Netlify | ✅ (after build) |

---

## Suggested order for you right now

1. `circuits/scripts/compile.sh` → `test_proof.sh`
2. `contracts/forge test`
3. `prover/npm run prove:demo`
4. `npm run dev` — confirm hash animation
5. Deploy to Sepolia → fill addresses in `.env` + `shared/addresses.json`
6. Test one on-chain commit from the UI
7. `npm run build` and deploy frontend when ready

If you want, switch to **Agent mode** and I can run Phase 1 checks for you and report what passes or fails.