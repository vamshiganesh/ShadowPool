import { Outlet } from 'react-router-dom'
import { AtmosphereStack } from '@/components/atmosphere'
import { Container } from '@/components/ui/Container'
import { TopNav, DocsSidebar, DocsMobileNav } from '@/components/navigation'
import { DocsScrollToTop } from '@/app/layouts/DocsScrollToTop'

export function DocsLayout() {
  return (
    <AtmosphereStack particles={false} glowIntensity="subtle">
      <DocsScrollToTop />
      <TopNav variant="docs" />
      <Container className="flex min-h-[calc(100dvh-5.5rem)]">
        <DocsSidebar />
        <main className="min-w-0 flex-1 py-8 lg:py-14">
          <div className="docs-reading mx-auto w-full">
            <DocsMobileNav />
            <Outlet />
          </div>
        </main>
      </Container>
    </AtmosphereStack>
  )
}
