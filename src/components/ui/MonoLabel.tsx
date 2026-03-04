import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface MonoLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: 'default' | 'muted' | 'accent' | 'faint'
  size?: 'micro' | 'sm' | 'default'
}

const variantClasses = {
  default: 'text-text-secondary',
  muted: 'text-text-muted',
  accent: 'text-orange-warm',
  faint: 'text-text-faint',
}

const sizeClasses = {
  micro: 'text-[10px] tracking-[0.2em]',
  sm: 'text-[11px] tracking-[0.16em]',
  default: 'text-xs tracking-wider',
}

export function MonoLabel({
  children,
  className,
  variant = 'default',
  size = 'default',
  ...props
}: MonoLabelProps) {
  return (
    <span
      className={cn(
        'font-mono uppercase',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
