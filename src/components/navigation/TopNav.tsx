import { Link } from 'react-router-dom'
import { APP_NAME, EXTERNAL_LINKS, NAV_LINKS, ROUTES } from '@/lib/constants/routes'
import { Container } from '@/components/ui/Container'
import { BeamButton } from '@/components/ui/BeamButton'
import { cn } from '@/lib/utils/cn'

interface TopNavProps {
  variant?: 'marketing' | 'docs'
}

export function TopNav({ variant = 'marketing' }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle/80 glass-surface-strong">
      <Container>
        <nav className="flex h-[4.25rem] items-center justify-between gap-8">
          <Link
            to={ROUTES.home}
            className="shrink-0 font-heading text-[1.125rem] font-semibold tracking-[-0.03em] text-text-primary transition-opacity hover:opacity-80"
          >
            {APP_NAME}
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {NAV_LINKS.marketing.map((link) =>
              link.external ? (
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
            {variant === 'docs' && (
              <Link
                to={ROUTES.app}
                className={cn(
                  'mr-2 hidden text-sm text-text-muted transition-colors hover:text-text-secondary sm:block',
                )}
              >
                Launch App
              </Link>
            )}
            <Link to={ROUTES.app}>
              <BeamButton size="sm">Launch App</BeamButton>
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  )
}
