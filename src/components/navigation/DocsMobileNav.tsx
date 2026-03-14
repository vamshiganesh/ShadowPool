import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'

const LINKS = [
  { to: ROUTES.docs.problem, label: 'Problem' },
  { to: ROUTES.docs.zkCommitments, label: 'Commitments' },
  { to: ROUTES.docs.circuitDiagram, label: 'Circuit' },
] as const

export function DocsMobileNav() {
  return (
    <nav
      className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-border-subtle glass-surface-light p-1 lg:hidden"
      aria-label="Documentation sections"
    >
      {LINKS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'shrink-0 rounded-md px-3 py-2 font-mono text-[10px] uppercase tracking-wider',
              isActive
                ? 'bg-orange-primary/15 text-orange-warm'
                : 'text-text-muted hover:text-text-secondary',
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
