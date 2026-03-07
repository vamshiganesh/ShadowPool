Part 3 is complete. The shared visual system and navigation shell are in place; `npm run build` passes.

## Shared components now exist

### Atmosphere (`src/components/atmosphere/`)
| Component | Role |
|---|---|
| `AtmosphereStack` | Composes all layers; used by every layout |
| `BackgroundGlow` | Top-center orange radial atmosphere |
| `LightRays` | SVG rays from top-center |
| `ParticleField` | Seeded floating particles (CSS, no canvas) |
| `NoiseOverlay` | Subtle film grain |

### UI primitives (`src/components/ui/`)
| Component | Role |
|---|---|
| `GlassCard` | Glass surface with optional glow + hover |
| `BeamButton` | Primary CTA with animated beam border |
| `GhostButton` | Secondary / low-emphasis actions |
| `MonoLabel` | Protocol micro-labels (micro/sm/default) |
| `StatusPill` | Live status indicators |
| `SectionEyebrow` | Standalone eyebrow label |
| `SectionHeading` | hero / page / section / card scale |
| `MetricCard` | Stat display for dashboards |
| `PanelHeader` | Panel title + actions row |
| `InfoRow` | Label/value protocol data row |
| `Divider` | Spaced section separator |
| `InlineCodePill` | Hashes, addresses, code snippets |
| `Container` | Width-constrained layout wrapper |

### Navigation (`src/components/navigation/`)
| Component | Role |
|---|---|
| `TopNav` | Marketing + docs top bar (wordmark only) |
| `AppSidebar` | App left nav + wallet chip |
| `DocsSidebar` | Docs left nav |
| `WalletChip` | Connect / connected wallet state |
| `ProtocolTicker` | Scrolling top stats bar (app layout) |
| `BottomStatusBar` | Protocol status footer (app layout) |
| `Footer` | Marketing page footer |

## Layout behavior

- **Marketing** — `AtmosphereStack` + `TopNav` + content + `Footer`
- **App** — `AppSidebar` + `ProtocolTicker` + main + `BottomStatusBar`
- **Docs** — `TopNav` + `DocsSidebar` + narrow reading column (`docs-reading`)

## Typography scale

Defined in `src/styles/globals.css`:
- `.text-hero` — landing headlines
- `.text-page-headline` — page titles
- `.text-section-headline` — section blocks
- `.text-card-title` — card/panel titles
- `.text-mono-micro` — protocol micro labels

## Reuse in future phases

**Use everywhere**
- `AtmosphereStack`, `GlassCard`, `BeamButton`, `GhostButton`
- `SectionEyebrow`, `SectionHeading`, `MonoLabel`, `Divider`
- `MetricCard`, `PanelHeader`, `InfoRow`, `InlineCodePill`, `StatusPill`

**Screen-specific shells**
- Landing → marketing layout + atmosphere (full rays + particles)
- `/app`, `/orders`, `/stats` → app layout + `ProtocolTicker` + `BottomStatusBar`
- Docs pages → docs layout + reading column (no glass card wrapper)

**Trading / proof surfaces (next phases)**
- `PanelHeader` + `InfoRow` + `InlineCodePill` for commitment detail
- `MetricCard` + `StatusPill` for stats and order states
- `WalletChip` stays in sidebar; extend with Wagmi later

Placeholder page shells remain minimal — only enough to verify routing inside the new frame. Run `npm run dev` and navigate `/`, `/app`, and `/docs/the-problem` to preview the shell.

Ready for Part 4 (screen implementation against the reference images).