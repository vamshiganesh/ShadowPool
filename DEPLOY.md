# Deploy ShadowPool to Sepolia

This guide gets contracts on-chain and the frontend listening to live events.

## Prerequisites

- [Foundry](https://getfoundry.sh) (`forge`, `cast`)
- Sepolia ETH on deployer wallet
- Circom circuit compiled (`cd circuits && bash scripts/compile.sh`)
- `.env` in repo root (copy from `.env.example`)

## 1. Compile contracts

```bash
cd circuits && bash scripts/compile.sh   # if circuit or zkey changed
cd ../contracts
forge build
forge test
```

**Important:** `contracts/src/Verifier.sol` must match `circuits/build/shadowpool_match_final.zkey`. After recompiling the circuit or regenerating the zkey, refresh the verifier:

```bash
npx snarkjs zkey export solidityverifier \
  circuits/build/shadowpool_match_final.zkey \
  contracts/src/Verifier.sol
```

Then redeploy (step 2). An out-of-date verifier causes `ProofInvalid()` on settlement even when the prover logs "Local verification OK".

## 2. Deploy to Sepolia

```bash
cd contracts
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

This writes **`shared/addresses.json`** with:

- `verifier`, `orderBook`, `settlement`
- `deployBlock` (used by the frontend to index events efficiently)

## 3. Configure frontend

In `.env` (repo root):

```env
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

Restart the dev server:

```bash
npm run dev
```

## 4. Verify live data

Open `/app` and check:

- **Live badge** shows **Sepolia live** (green pulse)
- **Settlement feed** updates when you submit commitments
- **Protocol ticker** shows open commitments, block number, latest tx
- **Stats page** KPIs reflect indexed on-chain data
- **Contract registry** links to Etherscan

Before deploy, the UI shows **Demo data** and falls back to static mocks.

## 5. Submit a test commitment

1. Connect MetaMask on **Sepolia**
2. Open **Trade** → enter price / amount
3. Click **Commit Order** (sends small ETH escrow)
4. Row appears in settlement feed as **ON-CHAIN**

## 6. Full settlement (your real orders)

`npm run prove:demo` only proves **circuit test vectors** — it does **not** settle the orders you submitted from the UI.

### Step A — Re-commit (if needed) after pulling latest code

New commits save `nonce` + `salt` locally (required for proving). Old commits cannot be settled without those secrets.

Use the **same amount** on both wallets (matcher requires equal `assetAmount`), e.g. `0.001` ETH and price `3421.50` on both sides (buy + sell).

### Step B — Export from each browser

1. Connect wallet → **Orders** → **Export Prover Pool**
2. Repeat on the second browser/wallet
3. Merge both JSON arrays into one file:

```bash
# prover/orders.pool.json  (array of 2+ objects)
```

### Step C — Run live prover

```bash
cd prover
# Uses ../.env — set SUBMIT_ON_CHAIN=1 (or true)
SUBMIT_ON_CHAIN=1 npm run prove:live
```

On success you'll see `OrdersSettled` on Sepolia. The UI updates to **Settled** within seconds.

### Troubleshooting

| Issue | Fix |
|-------|-----|
| `submit=false` in logs | Set `SUBMIT_ON_CHAIN=1` or `true` in `.env` |
| Demo hashes in logs | You ran `prove:demo` — use `prove:live` |
| `No matching pair` | Amounts must match exactly; bid price ≤ ask price |
| `Commitment mismatch` | Re-commit with latest UI (exports nonce/salt) |
| `ProofInvalid` / `0x7fcdd1f4` | Regenerate `Verifier.sol` from current zkey and **redeploy** the stack |
| Orders visible in export but not in table | Fixed in latest UI — orders merge `localStorage` + chain; pull and restart `npm run dev` |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Badge says "Demo data" | `shared/addresses.json` still has zero addresses — redeploy |
| Feed empty after commit | Check `VITE_SEPOLIA_RPC_URL`, wallet on Sepolia, Etherscan tx succeeded |
| **Index error** badge | Remove `VITE_INDEXER_RPC_URL=publicnode` from `.env`; restart dev server. Indexing now uses `statusOf` per order. |
| Slow bootstrap | Ensure `deployBlock` is in `addresses.json` after deploy |
| Orders page empty | Connect the wallet that submitted; orders also load from **localStorage** after refresh |

## What is live vs simulated

| Surface | Source |
|---------|--------|
| Settlement feed, ticker, stats KPIs, orders (your wallet) | **On-chain events** |
| Contract registry | **Deployed addresses** |
| Depth chart | **Hybrid** — drifts every ~6s; mid price tracks latest clearing price when available |
| Proof time charts | Static until prover telemetry is wired |
