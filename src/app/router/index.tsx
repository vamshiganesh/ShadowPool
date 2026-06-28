import { Suspense, lazy, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/lib/constants/routes'
import { MarketingLayout } from '@/app/layouts/MarketingLayout'
import { ApplicationLayout } from '@/app/layouts/ApplicationLayout'
import { DocsLayout } from '@/app/layouts/DocsLayout'
import { TradePage } from '@/pages/TradePage'
import { OrdersPage } from '@/pages/OrdersPage'
import { StatsPage } from '@/pages/StatsPage'

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col gap-4 p-6 lg:p-8" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-white/5" />
    </div>
  )
}

function lazyPage<P extends Record<string, ComponentType>>(
  loader: () => Promise<P>,
  exportName: keyof P,
) {
  const Lazy = lazy(() =>
    loader().then((mod) => ({ default: mod[exportName] as ComponentType })),
  )

  return function LazyPage() {
    return (
      <Suspense fallback={<PageLoader />}>
        <Lazy />
      </Suspense>
    )
  }
}

const LandingPage = lazyPage(() => import('@/pages/LandingPage'), 'LandingPage')
const MobileTradePage = lazyPage(() => import('@/pages/MobileTradePage'), 'MobileTradePage')
const DocsProblemPage = lazyPage(() => import('@/pages/DocsProblemPage'), 'DocsProblemPage')
const DocsZkCommitmentsPage = lazyPage(
  () => import('@/pages/DocsZkCommitmentsPage'),
  'DocsZkCommitmentsPage',
)
const DocsCircuitPage = lazyPage(() => import('@/pages/DocsCircuitPage'), 'DocsCircuitPage')

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: ROUTES.home, element: <LandingPage /> },
      { path: ROUTES.mobile, element: <MobileTradePage /> },
    ],
  },
  {
    element: <ApplicationLayout />,
    children: [
      { path: ROUTES.app, element: <TradePage /> },
      { path: ROUTES.orders, element: <OrdersPage /> },
      { path: ROUTES.stats, element: <StatsPage /> },
    ],
  },
  {
    element: <DocsLayout />,
    children: [
      { path: ROUTES.docs.problem, element: <DocsProblemPage /> },
      { path: ROUTES.docs.zkCommitments, element: <DocsZkCommitmentsPage /> },
      { path: ROUTES.docs.circuitDiagram, element: <DocsCircuitPage /> },
    ],
  },
])
