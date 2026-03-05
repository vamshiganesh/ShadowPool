import { StatusPill } from '@/components/ui/StatusPill'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { cn } from '@/lib/utils/cn'

interface BottomStatusBarProps {
  className?: string
}

export function BottomStatusBar({ className }: BottomStatusBarProps) {
  return (
    <footer
      className={cn(
        'flex h-9 shrink-0 items-center border-t border-border-subtle bg-bg-elevated/90 px-5',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <StatusPill label="Protocol Online" variant="success" />
          <MonoLabel variant="faint" size="sm" className="hidden normal-case sm:inline">
            Groth16 verifier · Circom v2
          </MonoLabel>
        </div>
        <MonoLabel variant="faint" size="sm" className="normal-case">
          ShadowPool v0.1
        </MonoLabel>
      </div>
    </footer>
  )
}
