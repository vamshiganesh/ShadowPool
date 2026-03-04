import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { SectionEyebrow } from './SectionEyebrow'

type HeadingSize = 'hero' | 'page' | 'section' | 'card'

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  size?: HeadingSize
  children?: ReactNode
}

const titleSizeClasses: Record<HeadingSize, string> = {
  hero: 'text-hero',
  page: 'text-page-headline',
  section: 'text-section-headline',
  card: 'text-card-title',
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  size = 'section',
  className,
  children,
  ...props
}: SectionHeadingProps) {
  const HeadingTag = size === 'hero' ? 'h1' : size === 'page' ? 'h1' : 'h2'

  return (
    <div
      className={cn(
        'space-y-4',
        align === 'center' && 'mx-auto max-w-2xl text-center',
        className,
      )}
      {...props}
    >
      {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
      <HeadingTag className={cn('font-heading text-text-primary', titleSizeClasses[size])}>
        {title}
      </HeadingTag>
      {description && (
        <p className="max-w-xl text-body-lg text-text-secondary leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  )
}
