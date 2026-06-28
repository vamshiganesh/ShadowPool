import { Suspense, lazy, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/lib/constants/routes'
import { MarketingLayout } from '@/app/layouts/MarketingLayout'
import { DocsLayout } from '@/app/layouts/DocsLayout'
import { LandingPage } from '@/pages/LandingPage'
import { DocsProblemPage } from '@/pages/DocsProblemPage'
import { DocsZkCommitmentsPage } from '@/pages/DocsZkCommitmentsPage'
import { DocsCircuitPage } from '@/pages/DocsCircuitPage'

function AppPageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8" aria-busy="true">
      <p className="font-mono text-[11px] uppercase tracking-wider text-text-faint">
        Loading terminal…
      </p>
    </div>
  )
}

function lazyPage<P extends Record<string, ComponentType>>(
  loader: () => Promise<P>,
  exportName: keyof P,
  fallback: React.ReactNode = <AppPageLoader />,
) {
  const Lazy = lazy(() =>
    loader().then((mod) => ({ default: mod[exportName] as ComponentType })),
  )

  return function LazyRoutePage() {
    return (
      <Suspense fallback={fallback}>
        <Lazy />
      </Suspense>
    )
  }
}

const AppTerminalLayout = lazyPage(
  () => import('@/app/appSection'),
  'AppTerminalLayout',
)

const MobileTradePage = lazyPage(() => import('@/pages/MobileTradePage'), 'MobileTradePage')

/** Marketing + docs eager; one lazy app shell for Trade / Orders / Stats. */
export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: ROUTES.home, element: <LandingPage /> },
      { path: ROUTES.mobile, element: <MobileTradePage /> },
    ],
  },
  {
    element: <AppTerminalLayout />,
    children: [
      { path: ROUTES.app },
      { path: ROUTES.orders },
      { path: ROUTES.stats },
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
