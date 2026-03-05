import { cn } from '@/lib/utils/cn'
import { useAppStore } from '@/store/appStore'

interface WalletChipProps {
  className?: string
}

export function WalletChip({ className }: WalletChipProps) {
  const { isConnected, setConnected } = useAppStore()

  return (
    <button
      type="button"
      onClick={() => setConnected(!isConnected)}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5',
        'transition-all duration-200',
        isConnected
          ? 'border-orange-primary/25 bg-orange-primary/8 hover:border-orange-primary/35'
          : 'border-border-subtle glass-surface-light hover:border-border-default',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            isConnected ? 'bg-emerald-400' : 'bg-text-faint',
          )}
          aria-hidden="true"
        />
        <span className="font-mono text-[11px] text-text-secondary">
          {isConnected ? '0x7a3f…9c2e' : 'Connect Wallet'}
        </span>
      </div>
      {!isConnected && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-orange-warm">
          Connect
        </span>
      )}
    </button>
  )
}
