import { NavLink, Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants/routes'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { cn } from '@/lib/utils/cn'

const DOC_SECTIONS = [
  {
    label: 'Introduction',
    links: [
      { label: 'The Problem', href: ROUTES.docs.problem },
    ],
  },
  {
    label: 'ZK Commitments',
    links: [
      { label: 'How Commitments Work', href: ROUTES.docs.zkCommitments },
      { label: 'Poseidon Hash', href: ROUTES.docs.zkCommitments },
    ],
  },
  {
    label: 'Circuit',
    links: [
      { label: 'Circuit Diagram', href: ROUTES.docs.circuitDiagram },
    ],
  },
] as const

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

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        {DOC_SECTIONS.map((section) => (
          <div key={section.label}>
            <MonoLabel variant="faint" size="micro" className="mb-2 px-3">
              {section.label}
            </MonoLabel>
            <div className="flex flex-col gap-0.5">
              {section.links.map((link) => (
                <NavLink
                  key={`${section.label}-${link.label}`}
                  to={link.href}
                  end={link.href === ROUTES.docs.problem}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2 text-sm transition-all duration-200',
                      isActive
                        ? 'border border-orange-primary/20 bg-orange-primary/10 font-medium text-orange-warm'
                        : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
