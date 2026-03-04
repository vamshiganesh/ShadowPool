Part 2 foundation is complete. The project builds successfully.

## File tree

```txt
ShadowPool/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig*.json
├── eslint.config.js
├── public/favicon.svg
├── References/IMG_References/          # existing screen refs
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── app/
    │   ├── router/index.tsx
    │   ├── providers/AppProviders.tsx
    │   └── layouts/
    │       ├── MarketingLayout.tsx
    │       ├── ApplicationLayout.tsx
    │       ├── DocsLayout.tsx
    │       └── ShellLayout.tsx
    ├── components/
    │   ├── ui/                         # primitives
    │   └── navigation/                 # TopNav, Sidebar, Footer
    ├── features/                       # stubs for later phases
    ├── pages/                          # placeholder shells
    ├── store/appStore.ts
    ├── lib/
    │   ├── constants/routes.ts
    │   ├── utils/
    │   └── mock/
    └── styles/
        ├── tokens.ts
        ├── globals.css
        ├── animations.css
        └── utilities.css
```

## Main setup files

| Concern | Files |
|---|---|
| Entry & app root | `src/main.tsx`, `src/App.tsx` |
| Routing | `src/app/router/index.tsx`, `src/lib/constants/routes.ts` |
| Layouts | `src/app/layouts/MarketingLayout.tsx`, `ApplicationLayout.tsx`, `DocsLayout.tsx` |
| Design tokens | `src/styles/tokens.ts`, `src/styles/globals.css`, `utilities.css`, `animations.css` |
| UI primitives | `src/components/ui/*` (GlassCard, PillButton, BeamWrapper, etc.) |
| Navigation shell | `src/components/navigation/TopNav.tsx`, `Sidebar.tsx`, `Footer.tsx` |
| State | `src/store/appStore.ts` (Zustand) |
| Build config | `vite.config.ts`, `package.json` |

## Routes ready

- `/` — Landing (marketing layout)
- `/app` — Trade (app layout + sidebar)
- `/orders` — Orders
- `/stats` — Protocol stats
- `/docs/the-problem`
- `/docs/zk-commitments`
- `/docs/circuit-diagram`

## Design system included

- Background `#080608`, orange palette `#AA2608` / `#C4390F` / `#B76653`
- Glass surfaces, orange radial glows, beam animation wrapper
- Typography: Plus Jakarta Sans, DM Sans, DM Mono
- Atmospheric layers (grain, glow orbs, top-center radial)
- Keyframes: pulse, beam rotation, slow float, shimmer, ticker scroll

## Commands to run

```bash
cd ~/projects/shadowpool/ShadowPool
npm run dev
```

Then open `http://localhost:5173` and navigate the routes above.

Dependencies are already installed and `npm run build` passes. You're ready for Part 3+ screen implementation using the `References/IMG_References` images.