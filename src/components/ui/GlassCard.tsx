import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'strong' | 'light'
  glow?: boolean
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantClasses = {
  default: 'glass-surface',
  strong: 'glass-surface-strong',
  light: 'glass-surface-light',
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  glow = false,
  interactive = false,
  padding = 'md',
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        variantClasses[variant],
        paddingClasses[padding],
        glow && 'glow-orange',
        interactive && 'transition-all duration-250 hover:border-border-default hover:bg-bg-surface/30',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
