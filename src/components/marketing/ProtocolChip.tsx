import { Cpu, FileCode2, Link2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const iconMap = {
  circuit: Cpu,
  matcher: Zap,
  settlement: FileCode2,
  proof: Link2,
} as const

interface ProtocolChipProps {
  label: string
  icon: keyof typeof iconMap
  className?: string
}

export function ProtocolChip({ label, icon, className }: ProtocolChipProps) {
  const Icon = iconMap[icon]

  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-border-subtle',
        'glass-surface-light px-3.5 py-2 font-mono text-[11px] text-text-secondary',
        'transition-colors hover:border-border-default hover:text-text-primary',
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 text-orange-warm opacity-80" />
      {label}
    </span>
  )
}
