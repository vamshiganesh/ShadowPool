Part 4 is complete. The `/` route is now a full landing composite built from modular sections. `npm run build` passes.

## Landing page composition

```
HeroSection
  → ProductPreviewSection (TradingAppPreview)
  → LandingTickerSection
  → StatsStripSection
  → HowItWorksSection
  → LifecycleSection
  → FinalCTASection
  → FooterSection
```

## Files created / updated

**New — `src/features/landing/`**
- `data.ts` — copy, stats, steps, lifecycle, ticker items
- `TradingAppPreview.tsx` — floating terminal mock
- `sections/HeroSection.tsx`
- `sections/ProductPreviewSection.tsx`
- `sections/LandingTickerSection.tsx`
- `sections/StatsStripSection.tsx`
- `sections/HowItWorksSection.tsx`
- `sections/LifecycleSection.tsx`
- `sections/FinalCTASection.tsx`
- `sections/FooterSection.tsx`
- `index.ts`

**New — `src/components/marketing/`**
- `ProtocolChip.tsx`
- `CodePanel.tsx`

**Updated**
- `src/pages/LandingPage.tsx` — composes all sections
- `src/app/layouts/MarketingLayout.tsx` — footer moved into landing
- `src/lib/constants/routes.ts` — Protocol nav → `/#how-it-works`

## Shared with app screens (reuse later)

| Component | Future use |
|---|---|
| `TradingAppPreview` | Marketing only; informs `/app` layout |
| `BeamButton`, `GhostButton` | CTAs everywhere |
| `GlassCard`, `StatusPill`, `InlineCodePill` | Orders, proof inspector, stats |
| `CodePanel` | Docs circuit page |
| `ProtocolChip` | Protocol metadata displays |
| `SectionHeading`, `MonoLabel`, `Divider` | All pages |
| `LifecycleSection` logic | Order detail / trade lifecycle UI |
| `LandingTickerSection` pattern | Distinct from app `ProtocolTicker` but same visual language |

## Screen mapping

- **Screen 1** — `HeroSection` (full viewport, rays via `AtmosphereStack`, headline, CTAs, chips)
- **Screen 2** — `HowItWorksSection` + `StatsStripSection` + `LifecycleSection`
- **Screen 11** — full composite with seamless spacing and `FooterSection` status strip

Run `npm run dev` and open `http://localhost:5173/` to preview. App routes remain link placeholders only.