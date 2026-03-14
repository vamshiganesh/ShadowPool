import { cn } from '@/lib/utils/cn'

interface DocsInlineCodeProps {
  children: string
  className?: string
}

export function DocsInlineCode({ children, className }: DocsInlineCodeProps) {
  return (
    <code
      className={cn(
        'rounded-md border border-orange-primary/20 bg-orange-primary/10 px-1.5 py-0.5',
        'font-mono text-[0.9em] text-orange-warm',
        className,
      )}
    >
      {children}
    </code>
  )
}
