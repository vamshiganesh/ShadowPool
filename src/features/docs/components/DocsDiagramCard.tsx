import type { ReactNode } from 'react'
import { ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DocsDiagramCardProps {
  title?: string
  caption?: string
  children: ReactNode
  className?: string
  footer?: ReactNode
}

export function DocsDiagramCard({
  title,
  caption,
  children,
  className,
  footer,
}: DocsDiagramCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated/50',
        className,
      )}
    >
      {(title || caption) && (
        <div className="flex items-start justify-between border-b border-border-subtle px-5 py-3">
          <div>
            {title && (
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                {title}
              </p>
            )}
            {caption && <p className="mt-0.5 text-xs text-text-muted">{caption}</p>}
          </div>
          <ZoomIn className="h-4 w-4 text-text-faint" aria-hidden="true" />
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="border-t border-border-subtle bg-bg-base/40 px-5 py-3 font-mono text-[11px] text-text-muted">
          {footer}
        </div>
      )}
    </div>
  )
}
