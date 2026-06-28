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
    <div>
      <h1 className="font-heading text-page-headline text-text-primary">My Orders</h1>
      <p className="mt-1 text-sm text-text-muted">
        All commitment activity for{' '}
        <span className="font-mono text-text-secondary">{display}</span>
      </p>
    </div>
  )
}
