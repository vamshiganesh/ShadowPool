export const APP_NAME = 'ShadowPool'

export const GITHUB_URL = 'https://github.com/vamshiganesh/ShadowPool'

export const ROUTES = {
  home: '/',
  app: '/app',
  orders: '/orders',
  stats: '/stats',
  docs: {
    problem: '/docs/the-problem',
    zkCommitments: '/docs/zk-commitments',
    circuitDiagram: '/docs/circuit-diagram',
  },
} as const

export const EXTERNAL_LINKS = {
  github: GITHUB_URL,
} as const

export const NAV_LINKS = {
  marketing: [
    { label: 'Protocol', href: '/#how-it-works' },
    { label: 'Docs', href: ROUTES.docs.problem },
    { label: 'GitHub', href: GITHUB_URL, external: true as const },
  ],
  app: [
    { label: 'Trade', href: ROUTES.app, icon: 'trade' as const },
    { label: 'Orders', href: ROUTES.orders, icon: 'orders' as const },
    { label: 'Stats', href: ROUTES.stats, icon: 'stats' as const },
  ],
  docs: [
    { label: 'The Problem', href: ROUTES.docs.problem },
    { label: 'ZK Commitments', href: ROUTES.docs.zkCommitments },
    { label: 'Circuit Diagram', href: ROUTES.docs.circuitDiagram },
  ],
} as const
