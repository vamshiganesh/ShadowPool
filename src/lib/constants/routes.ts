export const APP_NAME = 'ShadowPool'

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

export const NAV_LINKS = {
  marketing: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Docs', href: ROUTES.docs.problem },
    { label: 'Stats', href: ROUTES.stats },
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
