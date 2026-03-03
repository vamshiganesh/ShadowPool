import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'neutral'

interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  label: string
  variant?: StatusVariant
  dot?: boolean
}

const variantClasses: Record<StatusVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  error: 'bg-red-500/15 text-red-400 border-red-500/25',
  info: 'bg-orange-warm/15 text-orange-warm border-orange-warm/25',
  pending: 'bg-orange-primary/15 text-orange-primary border-orange-primary/30',
  neutral: 'bg-white/5 text-text-muted border-border-subtle',
}

const dotClasses: Record<StatusVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-red-400',
  info: 'bg-orange-warm',
  pending: 'bg-orange-primary animate-pulse-glow',
  neutral: 'bg-text-muted',
}

export function StatusPill({
  label,
  variant = 'neutral',
  dot = true,
  className,
  ...props
}: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5',
        'font-mono text-[11px] uppercase tracking-wide',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotClasses[variant])} aria-hidden="true" />
      )}
      {label}
    </span>
  )
}
