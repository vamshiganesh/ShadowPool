import { cn } from '@/lib/utils/cn'

interface KPIStatCardProps {
  label: string
  value: string
  trend?: string | null
  trendLabel?: string | null
  trendUp?: boolean | null
  progress?: number
}

export function KPIStatCard({
  label,
  value,
  trend,
  trendLabel,
  trendUp,
  progress,
}: KPIStatCardProps) {
  return (
    <div className="rounded-xl border border-border-subtle glass-surface px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">{label}</p>
      <p className="mt-2 font-heading text-xl font-semibold tracking-tight text-text-primary lg:text-2xl">
        {value}
      </p>
      {trend && trendLabel && (
        <p
          className={cn(
            'mt-1.5 font-mono text-[11px]',
            trendUp ? 'text-orange-warm' : 'text-text-muted',
          )}
        >
          {trend} {trendLabel}
        </p>
      )}
      {progress !== undefined && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-border-subtle">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-deep to-orange-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
