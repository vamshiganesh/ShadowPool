import { Download } from 'lucide-react'
import { GhostButton } from '@/components/ui/GhostButton'
import { downloadProverPoolExport } from '@/lib/protocol/localCommitments'
import { truncateHash } from '@/lib/protocol/format'

interface OrdersHeaderProps {
  walletAddress?: string
}

export function OrdersHeader({ walletAddress }: OrdersHeaderProps) {
  const display =
    walletAddress && walletAddress.length > 10
      ? truncateHash(walletAddress, 4, 4)
      : 'Connect wallet'

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-heading text-page-headline text-text-primary">My Orders</h1>
        <p className="mt-1 text-sm text-text-muted">
          All commitment activity for{' '}
          <span className="font-mono text-text-secondary">{display}</span>
        </p>
      </div>
      <GhostButton
        type="button"
        className="shrink-0 gap-2 border border-border-subtle"
        onClick={() => downloadProverPoolExport()}
      >
        <Download className="h-4 w-4" />
        Export Prover Pool
      </GhostButton>
    </div>
  )
}
