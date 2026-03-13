import { Download } from 'lucide-react'
import { GhostButton } from '@/components/ui/GhostButton'

interface OrdersHeaderProps {
  walletAddress?: string
}

export function OrdersHeader({ walletAddress = '0x71C…4f2' }: OrdersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-heading text-page-headline text-text-primary">My Orders</h1>
        <p className="mt-1 text-sm text-text-muted">
          All commitment activity for{' '}
          <span className="font-mono text-text-secondary">{walletAddress}</span>
        </p>
      </div>
      <GhostButton className="shrink-0 gap-2 border border-border-subtle">
        <Download className="h-4 w-4" />
        Export
      </GhostButton>
    </div>
  )
}
