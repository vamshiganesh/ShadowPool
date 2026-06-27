import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap } from 'lucide-react'
import { APP_NAME, NAV_LINKS, ROUTES } from '@/lib/constants/routes'
import { BeamLink } from '@/components/ui/BeamButton'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils/cn'

interface TopNavProps {
  variant?: 'marketing' | 'docs'
  opaque?: boolean
}

type NavLink = (typeof NAV_LINKS.marketing)[number] | (typeof NAV_LINKS.docs)[number]

function NavLinkItem({
  link,
  onNavigate,
}: {
  link: NavLink
  onNavigate?: () => void
}) {
  const location = useLocation()
  const isActive =
    !('external' in link && link.external) &&
    (location.pathname === link.href ||
      (link.href.startsWith('/docs/') && location.pathname === link.href))

  const className = cn(
    'rounded-lg px-3 py-1.5 text-sm transition-colors',
    isActive
      ? 'text-text-primary'
      : 'text-text-muted hover:text-text-secondary',
  )

  if ('external' in link && link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {link.label}
      </a>
    )
  }

  if (link.href.startsWith('/#')) {
    return (
      <a href={link.href} className={className} onClick={onNavigate}>
        {link.label}
      </a>
    )
  }

  return (
    <Link to={link.href} className={className} onClick={onNavigate}>
      {link.label}
    </Link>
  )
}

function LaunchCta({ className }: { className?: string }) {
  return (
    <BeamLink
      to={ROUTES.app}
      size="sm"
      shape="rounded"
      arrowBadge
      className={className}
    >
      Launch App
    </BeamLink>
  )
}

export function TopNav({ variant = 'marketing', opaque = false }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = variant === 'docs' ? NAV_LINKS.docs : NAV_LINKS.marketing

  return (
    <header className="sticky top-0 z-50 pt-4">
      <Container>
        <nav
          className={cn(
            'relative flex items-center justify-between gap-4 rounded-xl px-4 py-2.5 sm:px-5',
            opaque
              ? 'border border-border-subtle bg-bg-elevated/95 shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
              : 'glass-surface-strong shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
          )}
          aria-label="Main"
        >
          <Link
            to={ROUTES.home}
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-primary/15 text-orange-warm">
              <Zap className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <span className="font-heading text-[1.05rem] font-semibold tracking-[-0.03em] text-text-primary">
              {APP_NAME}
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:absolute md:left-1/2 md:-translate-x-1/2 md:flex">
            {links.map((link) => (
              <NavLinkItem key={link.href} link={link} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LaunchCta className="hidden sm:inline-flex" />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-muted transition-colors hover:border-border-default hover:text-text-secondary md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div
            className={cn(
              'mt-2 overflow-hidden rounded-xl border border-border-subtle/80 glass-surface-strong p-2 md:hidden',
              'shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
            )}
          >
            {links.map((link) => (
              <div key={link.href} className="px-1">
                <NavLinkItem link={link} onNavigate={() => setMenuOpen(false)} />
              </div>
            ))}
            <div className="mt-2 border-t border-border-subtle px-1 pt-2">
              <LaunchCta className="w-full justify-center" />
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
