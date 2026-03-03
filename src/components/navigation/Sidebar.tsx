import { NavLink } from 'react-router-dom'
import { Activity, ArrowLeftRight, FileText, LayoutList } from 'lucide-react'
import { APP_NAME, NAV_LINKS, ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'

const iconMap = {
  trade: ArrowLeftRight,
  orders: LayoutList,
  stats: Activity,
} as const

export function AppSidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border-subtle glass-surface">
      <div className="flex h-16 items-center gap-2.5 border-b border-border-subtle px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-orange-primary to-orange-deep">
          <span className="font-mono text-[10px] font-medium text-text-primary">SP</span>
        </div>
        <span className="font-heading text-sm font-semibold text-text-primary">{APP_NAME}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_LINKS.app.map((link) => {
          const Icon = iconMap[link.icon]
          return (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-orange-primary/10 text-orange-warm border border-orange-primary/20'
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
            </NavLink>
          )
        })}

        <div className="my-3 border-t border-border-subtle" />

        <p className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-text-faint">
          Documentation
        </p>
        {NAV_LINKS.docs.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'text-orange-warm'
                  : 'text-text-muted hover:text-text-secondary',
              )
            }
          >
            <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-4">
        <div className="rounded-lg glass-surface-light p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            Network
          </p>
          <p className="mt-1 text-xs text-text-secondary">Ethereum Mainnet</p>
        </div>
      </div>
    </aside>
  )
}

export function DocsSidebar() {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border-subtle glass-surface">
      <div className="border-b border-border-subtle p-5">
        <NavLink to={ROUTES.home} className="font-mono text-xs text-text-muted hover:text-text-secondary">
          ← Back to Home
        </NavLink>
        <h2 className="mt-3 font-heading text-sm font-semibold text-text-primary">Protocol Docs</h2>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_LINKS.docs.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-orange-primary/10 text-orange-warm border border-orange-primary/20'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary',
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
