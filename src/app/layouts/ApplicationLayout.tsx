import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { AtmosphereStack } from '@/components/atmosphere'
import { AppSidebar, ProtocolTicker, BottomStatusBar, AppMobileNav } from '@/components/navigation'
import { AppOverlays } from '@/components/trading/AppOverlays'
import { Web3Provider } from '@/app/providers/WagmiProvider'
import { ProtocolEventProvider } from '@/app/providers/ProtocolEventProvider'
import { prefetchPoseidon } from '@/lib/crypto/commitment'

interface ApplicationLayoutProps {
  /** When set, renders instead of the router outlet (app section bundle). */
  children?: ReactNode
}

export function ApplicationLayout({ children }: ApplicationLayoutProps) {
  useEffect(() => {
    const idle =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 800)

    idle(() => prefetchPoseidon())
  }, [])

  return (
    <Web3Provider>
      <ProtocolEventProvider>
        <AtmosphereStack particles={false} glowIntensity="subtle">
          <div className="flex h-[100dvh] flex-col lg:flex-row">
            <AppSidebar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <ProtocolTicker />
              <main className="min-h-0 flex-1 overflow-y-auto">
                {children ?? <Outlet />}
              </main>
              <BottomStatusBar className="hidden lg:flex" />
              <AppMobileNav />
            </div>
          </div>
          <AppOverlays />
        </AtmosphereStack>
      </ProtocolEventProvider>
    </Web3Provider>
  )
}
