import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/lib/constants/routes'
import { MarketingLayout } from '@/app/layouts/MarketingLayout'
import { ApplicationLayout } from '@/app/layouts/ApplicationLayout'
import { DocsLayout } from '@/app/layouts/DocsLayout'
import { LandingPage } from '@/pages/LandingPage'
import { TradePage } from '@/pages/TradePage'
import { OrdersPage } from '@/pages/OrdersPage'
import { StatsPage } from '@/pages/StatsPage'
import { DocsProblemPage } from '@/pages/DocsProblemPage'
import { DocsZkCommitmentsPage } from '@/pages/DocsZkCommitmentsPage'
import { DocsCircuitPage } from '@/pages/DocsCircuitPage'

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: ROUTES.home, element: <LandingPage /> },
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
