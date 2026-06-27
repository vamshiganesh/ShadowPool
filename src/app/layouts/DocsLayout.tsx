import { Outlet } from 'react-router-dom'
import { AtmosphereStack } from '@/components/atmosphere'
import { TopNav, DocsSidebar, DocsMobileNav } from '@/components/navigation'

export function DocsLayout() {
  return (
    <AtmosphereStack particles={false} glowIntensity="subtle">
      <TopNav variant="docs" />
      <div className="flex min-h-[calc(100dvh-5.5rem)]">
        <DocsSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
          <div className="docs-reading mx-auto max-w-3xl lg:max-w-4xl">
            <DocsMobileNav />
            <Outlet />
          </div>
        </main>
      </div>
    </AtmosphereStack>
  )
}
