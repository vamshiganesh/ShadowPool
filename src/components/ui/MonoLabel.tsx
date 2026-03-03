import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface MonoLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: 'default' | 'muted' | 'accent'
}

const variantClasses = {
  default: 'text-text-secondary',
  muted: 'text-text-muted',
  accent: 'text-orange-warm',
}

export function MonoLabel({
  children,
  className,
  variant = 'default',
  ...props
}: MonoLabelProps) {
  return (
    <span
      className={cn(
        'font-mono text-xs uppercase tracking-wider',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
