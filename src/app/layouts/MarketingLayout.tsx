import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AtmosphereStack } from '@/components/atmosphere'
import { TopNav } from '@/components/navigation'
import { LandingSmoothScroll } from '@/features/landing/providers/LandingSmoothScroll'
import { ROUTES } from '@/lib/constants/routes'
import { prefetchAppSection } from '@/lib/prefetchApp'

function prefetchAppWhenIdle() {
  const idle =
    typeof requestIdleCallback === 'function'
      ? requestIdleCallback
      : (cb: () => void) => window.setTimeout(cb, 1200)

  idle(() => prefetchAppSection())
}

export function MarketingLayout() {
  const { pathname } = useLocation()
  const isLanding = pathname === ROUTES.home

  useEffect(() => {
    prefetchAppWhenIdle()
  }, [])

  const content = (
    <AtmosphereStack
      particles
      particleCount={isLanding ? 100 : 32}
      particleDensity={isLanding ? 'light' : 'default'}
      noise={isLanding ? 'lite' : 'default'}
      glowIntensity={isLanding ? 'subtle' : 'default'}
    >
      <TopNav variant="marketing" opaque={isLanding} />
      <main>
        <Outlet />
      </main>
    </AtmosphereStack>
  )

  if (isLanding) {
    return <LandingSmoothScroll>{content}</LandingSmoothScroll>
  }

  return content
}
