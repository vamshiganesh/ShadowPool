import { Outlet } from 'react-router-dom'
import { AtmosphereStack } from '@/components/atmosphere'
import { TopNav, DocsSidebar } from '@/components/navigation'
import { Container } from '@/components/ui/Container'


export function DocsLayout() {
  return (
    <AtmosphereStack particles={false} glowIntensity="subtle">
      <TopNav variant="docs" />
      <div className="flex min-h-[calc(100vh-4.25rem)]">
        <DocsSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto py-10 lg:py-14">
          <Container size="narrow" className="docs-reading">
            <Outlet />
          </Container>
        </main>
      </div>
    </AtmosphereStack>
  )
}
