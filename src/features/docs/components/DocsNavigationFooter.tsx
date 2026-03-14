import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DocsNavLink {
  label: string
  href: string
  direction: 'prev' | 'next'
}

interface DocsNavigationFooterProps {
  prev?: DocsNavLink
  next?: DocsNavLink
}

export function DocsNavigationFooter({ prev, next }: DocsNavigationFooterProps) {
  return (
    <div className="grid gap-3 border-t border-border-subtle pt-10 sm:grid-cols-2">
      {prev ? (
        <NavCard link={prev} />
      ) : (
        <div />
      )}
      {next && <NavCard link={next} />}
    </div>
  )
}

function NavCard({ link }: { link: DocsNavLink }) {
  const isNext = link.direction === 'next'

  return (
    <Link
      to={link.href}
      className={cn(
        'group flex flex-col rounded-xl border border-border-subtle glass-surface-light p-5 transition-all',
        'hover:border-border-default hover:bg-bg-elevated/30',
        isNext && 'sm:items-end sm:text-right',
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
        {isNext ? 'Continue' : 'Back'}
      </span>
      <span className="mt-1 flex items-center gap-2 font-heading text-sm font-medium text-text-primary group-hover:text-orange-warm">
        {!isNext && <ArrowLeft className="h-4 w-4" />}
        {link.label}
        {isNext && <ArrowRight className="h-4 w-4" />}
      </span>
    </Link>
  )
}
