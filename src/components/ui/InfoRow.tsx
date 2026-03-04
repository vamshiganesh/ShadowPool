import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { MonoLabel } from './MonoLabel'

interface InfoRowProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: ReactNode
  mono?: boolean
}

export function InfoRow({ label, value, mono = false, className, ...props }: InfoRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-3',
        className,
      )}
      {...props}
    >
      <MonoLabel variant="muted">{label}</MonoLabel>
      <span
        className={cn(
          'text-sm text-text-secondary',
          mono && 'font-mono text-xs text-text-primary',
        )}
      >
        {value}
      </span>
    </div>
  )
}
