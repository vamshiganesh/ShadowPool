import { NavLink, Link } from 'react-router-dom'
import { Activity, ArrowLeftRight, LayoutList } from 'lucide-react'
import { APP_NAME, NAV_LINKS, ROUTES } from '@/lib/constants/routes'
import { WalletChip } from './WalletChip'
import { cn } from '@/lib/utils/cn'

const iconMap = {
  trade: ArrowLeftRight,
  orders: LayoutList,
  stats: Activity,
} as const

export function AppSidebar() {
  return (
    <aside className="flex h-full w-[15.5rem] shrink-0 flex-col border-r border-border-subtle glass-surface">
      <div className="flex h-[4.25rem] items-center border-b border-border-subtle px-5">
        <Link
          to={ROUTES.home}
          className="font-heading text-[0.9375rem] font-semibold tracking-[-0.02em] text-text-primary transition-opacity hover:opacity-80"
        >
          {APP_NAME}
        </Link>
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'border border-orange-primary/20 bg-orange-primary/10 text-orange-warm'
                    : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {link.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-3 border-t border-border-subtle p-4">
        <WalletChip />
        <div className="rounded-lg glass-surface-light px-3 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">Network</p>
          <p className="mt-1 text-xs text-text-secondary">Ethereum Mainnet</p>
        </div>
      </div>
    </aside>
  )
}
