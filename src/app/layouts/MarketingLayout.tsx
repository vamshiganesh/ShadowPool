import { Outlet } from 'react-router-dom'
import { BackgroundLayers } from '@/components/ui/BackgroundLayers'
import { TopNav } from '@/components/navigation/TopNav'
import { Footer } from '@/components/navigation/Footer'

export function MarketingLayout() {
  return (
    <BackgroundLayers>
      <TopNav variant="marketing" />
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <Footer />
    </BackgroundLayers>
  )
}
