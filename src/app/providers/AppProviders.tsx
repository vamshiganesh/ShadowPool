import type { ReactNode } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'

interface AppProvidersProps {
  children?: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  if (children) {
    return <>{children}</>
  }

  return <RouterProvider router={router} />
}
