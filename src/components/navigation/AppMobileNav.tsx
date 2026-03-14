import { NavLink } from 'react-router-dom'
import { Activity, ArrowLeftRight, LayoutList } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'

const LINKS = [
  { to: ROUTES.app, label: 'Trade', icon: ArrowLeftRight },
  { to: ROUTES.orders, label: 'Orders', icon: LayoutList },
  { to: ROUTES.stats, label: 'Stats', icon: Activity },
] as const

export function AppMobileNav() {
  return (
    <nav
      className="flex border-t border-border-subtle bg-bg-elevated/95 lg:hidden"
      aria-label="App navigation"
    >
      {LINKS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 font-mono text-[9px] uppercase tracking-wider',
              isActive ? 'text-orange-warm' : 'text-text-faint',
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
