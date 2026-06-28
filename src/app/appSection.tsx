import { useLocation } from 'react-router-dom'
import { ApplicationLayout as BaseApplicationLayout } from '@/app/layouts/ApplicationLayout'
import { TradePage } from '@/pages/TradePage'
import { OrdersPage } from '@/pages/OrdersPage'
import { StatsPage } from '@/pages/StatsPage'
import { ROUTES } from '@/lib/constants/routes'

function AppTerminalPage() {
  const { pathname } = useLocation()

  if (pathname === ROUTES.orders) return <OrdersPage />
  if (pathname === ROUTES.stats) return <StatsPage />
  return <TradePage />
}

/** App shell + terminal pages — one lazy chunk, instant tab switches after load. */
export function AppTerminalLayout() {
  return (
    <BaseApplicationLayout>
      <AppTerminalPage />
    </BaseApplicationLayout>
  )
}
