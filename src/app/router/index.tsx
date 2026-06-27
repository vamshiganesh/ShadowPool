import { Suspense, lazy, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/lib/constants/routes'
import { MarketingLayout } from '@/app/layouts/MarketingLayout'
import { ApplicationLayout } from '@/app/layouts/ApplicationLayout'
import { DocsLayout } from '@/app/layouts/DocsLayout'

function PageLoader() {
  return <div className="min-h-screen bg-bg-base" aria-busy="true" />
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
const TradePage = lazyPage(() => import('@/pages/TradePage'), 'TradePage')
const OrdersPage = lazyPage(() => import('@/pages/OrdersPage'), 'OrdersPage')
const StatsPage = lazyPage(() => import('@/pages/StatsPage'), 'StatsPage')
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
