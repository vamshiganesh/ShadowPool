import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { MonoLabel } from './MonoLabel'

interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
}

const trendClasses = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  neutral: 'text-text-muted',
}

export function MetricCard({
  label,
  value,
  subValue,
  trend = 'neutral',
  icon,
  className,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'glass-surface rounded-xl p-5 transition-colors hover:border-border-default',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <MonoLabel variant="muted">{label}</MonoLabel>
        {icon && <span className="text-text-faint">{icon}</span>}
      </div>
      <p className="mt-3 font-heading text-2xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>
      {subValue && (
        <p className={cn('mt-1 font-mono text-xs', trendClasses[trend])}>{subValue}</p>
      )}
    </div>
  )
}
