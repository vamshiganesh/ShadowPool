import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { BackgroundLayers } from '@/components/ui/BackgroundLayers'
import { StatusBar } from '@/components/navigation/Footer'

interface ShellLayoutProps {
  sidebar: ReactNode
}

export function ShellLayout({ sidebar }: ShellLayoutProps) {
  return (
    <BackgroundLayers showParticles={false}>
      <div className="flex h-screen flex-col">
        <div className="flex min-h-0 flex-1">
          {sidebar}
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="min-h-0 flex-1 overflow-y-auto">
              <Outlet />
            </main>
            <StatusBar />
          </div>
        </div>
      </div>
    </BackgroundLayers>
  )
}
