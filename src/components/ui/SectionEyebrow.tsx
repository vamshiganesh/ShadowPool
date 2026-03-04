import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface SectionEyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  children: string
  variant?: 'default' | 'accent' | 'muted'
}

const variantClasses = {
  default: 'text-orange-warm',
  accent: 'text-orange-primary',
  muted: 'text-text-muted',
}

export function SectionEyebrow({
  children,
  className,
  variant = 'default',
  ...props
}: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        'font-mono text-[11px] uppercase tracking-[0.22em]',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </p>
  )
}
