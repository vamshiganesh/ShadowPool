Part 6 is complete. `/orders` and `/stats` are built as premium, data-rich pages. `npm run build` passes.

## Data modules

| Module | Path | Contents |
|---|---|---|
| `mockOrders.ts` | `features/orders/data/` | Order rows, filter counts, summary metrics, `filterOrders()` |
| `mockStats.ts` | `features/stats/data/` | KPIs, volume chart series, proof time buckets, circuit health, recent settlements, contract registry |

Swap these for API/indexer hooks later by keeping the same TypeScript interfaces.

## Reusable components

**Orders** (`features/orders/components/`)
- `OrdersHeader` — title, wallet scope, export action
- `OrdersFilterTabs` — All / Pending / Proving / Settled with counts
- `OrdersSummaryStrip` — 4 metric cards with orange left accent
- `OrdersTable` — glass table + empty state
- `OrdersTableRow` — proving row glow + elapsed microcopy
- `PaginationPills` — circular page controls

**Stats** (`features/stats/components/`)
- `StatsHeader` — live status + time range selector (1H–ALL)
- `KPIStatCard` — metric + trend + optional progress bar
- `SettlementVolumeChart` — 7-day orange SVG area/line chart
- `ProofTimeDistribution` — horizontal orange bar distribution
- `CircuitHealthCard` — circuit metadata + decorative node diagram
- `RecentSettlementsCard` — live settlements table with listening indicator
- `ContractRegistryCard` — deployed contract list

## Chart library choice

**No chart library added** — charts use custom **SVG** (`SettlementVolumeChart`) and **CSS bars** (`ProofTimeDistribution`), matching the existing `DepthChartCard` approach.

Reasons:
- Full control over the orange palette (`#AA2608` → `#C4390F` → `#B76653`)
- No default blue/teal chart theming to override
- Zero extra bundle weight
- Easy to replace with Recharts later by feeding the same `VOLUME_CHART_DATA` / `PROOF_TIME_BUCKETS` arrays

## Integration notes

- **Inspect** on orders opens `ProofInspectorModal` (pending/proving) or `CommitmentDetailDrawer` (settled)
- Filter + pagination are local state; swap for URL params or server pagination when wired to real data
- Empty state shows when a filter returns no rows

Preview: `npm run dev` → `/orders` and `/stats`