import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  size?: 'default' | 'narrow' | 'wide' | 'full'
}

const sizeClasses = {
  default: 'max-w-7xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-[1400px]',
  full: 'max-w-full',
}

export function Container({
  children,
  className,
  size = 'default',
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  )
}
