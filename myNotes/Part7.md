Part 7 is complete. All three docs pages are live. `npm run build` passes.

## Docs components (`src/features/docs/components/`)

| Component | Purpose |
|---|---|
| `DocsPageShell` | Page title, eyebrow, description, meta strip |
| `DocsSection` | Section headings with anchor IDs |
| `DocsCallout` | Warning / info / success callouts |
| `DocsDiagramCard` | Diagram container with caption + footer |
| `DocsComparisonPanel` | 3-column mitigation comparison cards |
| `DocsInlineCode` | Orange inline code pills |
| `DocsDataTable` | Technical parameter tables |
| `DocsNavigationFooter` | Prev/next page navigation cards |

## Page content (`src/features/docs/content/`)

| Route | File | Key sections |
|---|---|---|
| `/docs/the-problem` | `TheProblemContent.tsx` | Mempool diagram, front-running callout, mitigation comparison, ZK differentiator |
| `/docs/zk-commitments` | `ZkCommitmentsContent.tsx` | Before/after panels, Poseidon formula, schema table, hash demo, commit-reveal flow |
| `/docs/circuit-diagram` | `CircuitDiagramContent.tsx` | Circuit SVG, constraint bar, signal table, Circom source |

## Diagram code location

| Diagram | Path |
|---|---|
| Mempool flow (Screen 8) | `src/features/docs/diagrams/MempoolFlowDiagram.tsx` |
| Circuit architecture (Screen 10) | `src/features/docs/diagrams/CircuitDiagram.tsx` |

Both are hand-crafted **SVG** — orange palette, mono labels, no generic flowchart library.

## Manual polish candidates later

1. **Poseidon demo** — replace `pseudoHash()` with real Poseidon via `circomlibjs` in-browser
2. **Circuit diagram** — add pan/zoom on the diagram card (zoom icon is decorative for now)
3. **Sidebar** — deduplicate "Poseidon Hash" link or add dedicated anchor sections
4. **Circom source block** — sync with actual `shadowpool_match.circom` when the circuit is implemented
5. **Mempool diagram** — animate the dashed orange wire on scroll for extra polish

Preview: `npm run dev` → `/docs/the-problem`, `/docs/zk-commitments`, `/docs/circuit-diagram`