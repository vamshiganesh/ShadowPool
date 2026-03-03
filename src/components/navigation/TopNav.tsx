import { Link } from 'react-router-dom'
import { APP_NAME, NAV_LINKS, ROUTES } from '@/lib/constants/routes'
import { Container } from '@/components/ui/Container'
import { PillButton } from '@/components/ui/PillButton'
import { cn } from '@/lib/utils/cn'

interface TopNavProps {
  variant?: 'marketing' | 'minimal'
}

export function TopNav({ variant = 'marketing' }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle glass-surface-strong">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-6">
          <Link to={ROUTES.home} className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-primary to-orange-deep shadow-glow">
              <span className="font-mono text-xs font-medium text-text-primary">SP</span>
            </div>
            <span className="font-heading text-lg font-semibold tracking-tight text-text-primary">
              {APP_NAME}
            </span>
          </Link>

          {variant === 'marketing' && (
            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.marketing.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.docs.problem}
              className={cn(
                'hidden text-sm text-text-muted transition-colors hover:text-text-secondary sm:block',
                variant === 'minimal' && 'sm:hidden',
              )}
            >
              Docs
            </Link>
            <Link to={ROUTES.app}>
              <PillButton size="sm" beam>
                Launch App
              </PillButton>
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  )
}
