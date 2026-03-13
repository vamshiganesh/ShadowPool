import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PaginationPillsProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PaginationPills({ page, totalPages, onPageChange }: PaginationPillsProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-2">
      <PageButton
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </PageButton>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full font-mono text-[11px] transition-colors',
            p === page
              ? 'bg-orange-primary text-text-primary'
              : 'text-text-muted hover:bg-white/5 hover:text-text-secondary',
          )}
        >
          {p}
        </button>
      ))}

      <PageButton
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </PageButton>
    </div>
  )
}

function PageButton({
  children,
  onClick,
  disabled,
  ...props
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors',
        'hover:bg-white/5 hover:text-text-secondary disabled:opacity-30 disabled:hover:bg-transparent',
      )}
      {...props}
    >
      {children}
    </button>
  )
}
