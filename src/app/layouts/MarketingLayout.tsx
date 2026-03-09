import { Outlet } from 'react-router-dom'
import { AtmosphereStack } from '@/components/atmosphere'
import { TopNav } from '@/components/navigation'

export function MarketingLayout() {
  return (
    <AtmosphereStack>
      <TopNav variant="marketing" />
      <main>
        <Outlet />
      </main>
    </AtmosphereStack>
  )
}
