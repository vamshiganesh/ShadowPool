import { Outlet } from 'react-router-dom'
import { AtmosphereStack } from '@/components/atmosphere'
import { TopNav, Footer } from '@/components/navigation'

export function MarketingLayout() {
  return (
    <AtmosphereStack>
      <TopNav variant="marketing" />
      <main className="min-h-[calc(100vh-4.25rem)]">
        <Outlet />
      </main>
      <Footer />
    </AtmosphereStack>
  )
}
