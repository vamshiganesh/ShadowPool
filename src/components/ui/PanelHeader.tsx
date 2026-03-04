import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { MonoLabel } from './MonoLabel'

interface PanelHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
}

export function PanelHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
  ...props
}: PanelHeaderProps) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 border-b border-border-subtle pb-5', className)}
      {...props}
    >
      <div className="space-y-1.5">
        {eyebrow && <MonoLabel variant="accent">{eyebrow}</MonoLabel>}
        <h3 className="font-heading text-card-title text-text-primary">{title}</h3>
        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
