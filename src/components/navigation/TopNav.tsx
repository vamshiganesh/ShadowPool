import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { APP_NAME, NAV_LINKS, ROUTES } from '@/lib/constants/routes'
import { Container } from '@/components/ui/Container'
import { BeamLink } from '@/components/ui/BeamButton'

interface TopNavProps {
  variant?: 'marketing' | 'docs'
}

export function TopNav({ variant: _variant = 'marketing' }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle/80 glass-surface-strong">
      <Container>
        <nav className="flex h-[4.25rem] items-center justify-between gap-4" aria-label="Main">
          <Link
            to={ROUTES.home}
            className="shrink-0 font-heading text-[1.125rem] font-semibold tracking-[-0.03em] text-text-primary transition-opacity hover:opacity-80"
          >
            {APP_NAME}
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {NAV_LINKS.marketing.map((link) =>
              'external' in link && link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          <div className="flex items-center gap-2">
            <BeamLink to={ROUTES.app} size="sm">
              Launch App
            </BeamLink>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-muted md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-border-subtle py-3 md:hidden">
            {NAV_LINKS.marketing.map((link) =>
              'external' in link && link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-2 py-2.5 text-sm text-text-secondary"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-2 py-2.5 text-sm text-text-secondary"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        )}
      </Container>
    </header>
  )
}
