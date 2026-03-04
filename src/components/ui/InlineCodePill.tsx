import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface InlineCodePillProps extends HTMLAttributes<HTMLSpanElement> {
  children: string
  truncate?: boolean
}

export function InlineCodePill({
  children,
  className,
  truncate = false,
  ...props
}: InlineCodePillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-border-subtle',
        'bg-bg-elevated/80 px-2 py-0.5 font-mono text-[11px] text-orange-warm',
        truncate && 'max-w-[200px] truncate',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
