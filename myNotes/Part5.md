Part 5 is complete. The trading surfaces are built with strong component decomposition. `npm run build` passes.

## Routes

| Route | Screen | Implementation |
|---|---|---|
| `/app` | Screen 3 — Trading Terminal | `TradeTerminal` (3-column layout) |
| (overlay) | Screen 4 — Commitment Detail | `CommitmentDetailDrawer` |
| (overlay) | Screen 5 — Proof Inspector | `ProofInspectorModal` |
| `/mobile` | Screen 11 — Mobile Terminal | `MobileTradeShowcase` + iPhone frame |

## New feature components

**Trade (`src/components/trading/` + `src/features/trade/`)**
- `PairHeader` — pair selector + market stats
- `DepthChartCard` — SVG mirrored depth chart + resolution toggles
- `SettlementFeedTable` — live feed with clickable tx hashes
- `OrderEntryPanel` — buy/sell, inputs, commit CTA
- `CommitmentHashBox` — ZK hash display
- `LifecycleStepper` — vertical (desktop) / horizontal (mobile)
- `TradeTerminal` — composes the full `/app` layout

**Overlays (`src/features/trade/overlays/` + `src/features/proof-inspector/`)**
- `CommitmentDetailDrawer` — slide-in glass drawer (params, proof, settlement, actions)
- `ProofInspectorModal` — tabbed modal (Proof Data / Public Signals / Circuit Info)

**Mobile (`src/features/mobile/`)**
- `MobileTradeScreen` — native mobile layout (not shrunk desktop)
- `MobileDeviceFrame` — iPhone-style frame + floating status cards
- `MobileTradeShowcase` — marketing page wrapper

**Infrastructure**
- `src/lib/hooks/useOverlay.ts` — escape key + scroll lock (logic separated from UI)
- `src/store/tradeStore.ts` — order form, overlays, lifecycle stage

## Mock data modules (replaceable)

| Module | Contents |
|---|---|
| `mockMarket.ts` | Pair, depth data, resolutions |
| `mockSettlements.ts` | Settlement feed rows |
| `mockCommitment.ts` | Full commitment detail + raw proof |
| `mockProof.ts` | Proof inspector data + constraint breakdown |
| `mockLifecycle.ts` | Lifecycle stages + default active stage |

## What’s mocked vs. future wiring

**Mocked now**
- Market prices, depth, settlements
- Commitment hash generation
- Proof JSON / verification status
- Lifecycle progression (static at "Matched")
- Wallet connection (still in `appStore` via `WalletChip`)

**Can connect later**
- **Wagmi/Viem** → `WalletChip`, `Commit Order`, explorer links
- **tradeStore** → real order submission + commitment hash from circom/snarkjs
- **mockCommitment / mockProof** → swap for API/on-chain proof payloads
- **LifecycleStepper** → drive from order status events / websocket
- **SettlementFeedTable** → live indexer feed

## Shared with other screens

`GlassCard`, `StatusPill`, `InfoRow`, `MonoLabel`, `BeamButton`, `GhostButton`, `LifecycleStepper`, and `CommitmentHashBox` are reused across `/app`, `/mobile`, and future `/orders` work.

Preview:
```bash
npm run dev
# /app     — desktop terminal
# /mobile  — mobile showcase
# Click settlement tx hashes or "Commit Order" to open overlays
```