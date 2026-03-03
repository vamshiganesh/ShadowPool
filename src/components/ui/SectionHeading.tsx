import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  children?: ReactNode
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  children,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'space-y-3',
        align === 'center' && 'text-center mx-auto max-w-2xl',
        className,
      )}
      {...props}
    >
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-warm">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-base text-text-secondary leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  )
}
