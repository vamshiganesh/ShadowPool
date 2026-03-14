import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { SectionEyebrow } from '@/components/ui/SectionEyebrow'

interface DocsPageShellProps {
  title: string
  description?: string
  eyebrow?: string
  meta?: ReactNode
  children: ReactNode
  wide?: boolean
  className?: string
}

export function DocsPageShell({
  title,
  description,
  eyebrow,
  meta,
  children,
  wide = false,
  className,
}: DocsPageShellProps) {
  return (
    <article className={cn('animate-fade-in', wide && 'max-w-none', className)}>
      {eyebrow && <SectionEyebrow className="mb-4">{eyebrow}</SectionEyebrow>}
      <h1 className="font-heading text-page-headline text-text-primary">{title}</h1>
      {description && (
        <p className="mt-4 text-body-lg leading-relaxed text-text-secondary">{description}</p>
      )}
      {meta && <div className="mt-4">{meta}</div>}
      <div className="mt-10 space-y-12">{children}</div>
    </article>
  )
}
