import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CommitmentHashBoxProps {
  hash: string
  className?: string
}

export function CommitmentHashBox({ hash, className }: CommitmentHashBoxProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
        ZK Commitment Hash
      </p>
      <div className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-bg-elevated/60 px-3 py-2.5">
        <Lock className="h-3.5 w-3.5 shrink-0 text-orange-warm/70" />
        <span className="truncate font-mono text-xs text-orange-warm">{hash}</span>
      </div>
    </div>
  )
}
