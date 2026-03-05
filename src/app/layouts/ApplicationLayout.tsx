import { Outlet } from 'react-router-dom'
import { AtmosphereStack } from '@/components/atmosphere'
import { AppSidebar, ProtocolTicker, BottomStatusBar } from '@/components/navigation'

export function ApplicationLayout() {
  return (
    <AtmosphereStack particles={false} glowIntensity="subtle">
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <ProtocolTicker />
          <main className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <BottomStatusBar />
        </div>
      </div>
    </AtmosphereStack>
  )
}
