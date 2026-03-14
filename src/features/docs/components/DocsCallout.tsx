import type { ReactNode } from 'react'
import { AlertTriangle, Info, Shield } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type CalloutVariant = 'warning' | 'info' | 'success'

interface DocsCalloutProps {
  title: string
  children: ReactNode
  variant?: CalloutVariant
}

const variantStyles = {
  warning: {
    border: 'border-orange-primary/35',
    bg: 'bg-orange-primary/8',
    icon: AlertTriangle,
    iconColor: 'text-orange-warm',
  },
  info: {
    border: 'border-border-default',
    bg: 'bg-bg-elevated/40',
    icon: Info,
    iconColor: 'text-text-muted',
  },
  success: {
    border: 'border-emerald-500/25',
    bg: 'bg-emerald-500/5',
    icon: Shield,
    iconColor: 'text-emerald-400',
  },
}

export function DocsCallout({ title, children, variant = 'warning' }: DocsCalloutProps) {
  const style = variantStyles[variant]
  const Icon = style.icon

  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        style.border,
        style.bg,
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', style.iconColor)} />
        <div>
          <p className="font-heading text-sm font-semibold text-text-primary">{title}</p>
          <div className="mt-2 text-sm leading-relaxed text-text-secondary">{children}</div>
        </div>
      </div>
    </div>
  )
}
