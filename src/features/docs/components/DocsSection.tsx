import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface DocsSectionProps {
  title?: string
  children: ReactNode
  id?: string
  className?: string
}

export function DocsSection({ title, children, id, className }: DocsSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-24', className)}>
      {title && (
        <h2 className="mb-5 font-heading text-section-headline text-text-primary">{title}</h2>
      )}
      {children}
    </section>
  )
}
