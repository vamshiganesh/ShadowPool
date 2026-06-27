import { areContractsDeployed } from '@/lib/contracts/addresses'
import { useProtocolEventStore } from '@/store/protocolEventStore'
import { cn } from '@/lib/utils/cn'

interface LiveDataBadgeProps {
  className?: string
}

export function LiveDataBadge({ className }: LiveDataBadgeProps) {
  const isBootstrapped = useProtocolEventStore((s) => s.isBootstrapped)
  const bootstrapError = useProtocolEventStore((s) => s.bootstrapError)
  const commitmentCount = useProtocolEventStore((s) => s.commitments.size)
  const settlementCount = useProtocolEventStore((s) => s.settlements.length)
  const deployed = areContractsDeployed()

  if (!deployed) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-text-faint',
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-text-faint/50" />
        Demo data
      </span>
    )
  }

  const isLive = isBootstrapped && !bootstrapError
  const isIndexing = isBootstrapped && bootstrapError && (commitmentCount > 0 || settlementCount > 0)
  const isSyncing = isBootstrapped && !bootstrapError && commitmentCount === 0 && settlementCount === 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider',
        isLive || isIndexing ? 'text-emerald-400' : bootstrapError ? 'text-red-400' : isSyncing ? 'text-amber-400' : 'text-amber-400',
        className,
      )}
      title={bootstrapError ?? undefined}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isLive || isIndexing
            ? 'animate-pulse-glow bg-emerald-400'
            : bootstrapError
              ? 'bg-red-400'
              : 'bg-amber-400',
        )}
      />
      {isLive || isIndexing
        ? 'Sepolia live'
        : bootstrapError
          ? 'Index error'
          : isSyncing
            ? 'Syncing chain…'
            : 'Connecting…'}
    </span>
  )
}
