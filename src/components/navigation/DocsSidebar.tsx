import { NavLink, Link } from 'react-router-dom'
import { ROUTES, NAV_LINKS } from '@/lib/constants/routes'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { cn } from '@/lib/utils/cn'

export function DocsSidebar() {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border-subtle glass-surface">
      <div className="border-b border-border-subtle px-5 py-5">
        <Link
          to={ROUTES.home}
          className="font-mono text-[11px] text-text-muted transition-colors hover:text-text-secondary"
        >
          ← Home
        </Link>
        <h2 className="mt-4 font-heading text-sm font-semibold tracking-tight text-text-primary">
          Documentation
        </h2>
        <p className="mt-1 text-xs text-text-muted">Protocol architecture & ZK design</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        <MonoLabel variant="faint" size="micro" className="mb-2 px-3">
          Guides
        </MonoLabel>
        {NAV_LINKS.docs.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                isActive
                  ? 'border border-orange-primary/20 bg-orange-primary/10 font-medium text-orange-warm'
                  : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
