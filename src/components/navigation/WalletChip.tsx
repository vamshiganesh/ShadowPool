import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectWalletModal } from '@/features/wallet/ConnectWalletModal'
import { sepoliaExplorerUrl, truncateAddress } from '@/lib/wallet/format'
import { cn } from '@/lib/utils/cn'

interface WalletChipProps {
  className?: string
}

export function WalletChip({ className }: WalletChipProps) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [modalOpen, setModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isConnected && modalOpen) {
      setModalOpen(false)
    }
  }, [isConnected, modalOpen])

  useEffect(() => {
    if (!menuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const handleChipClick = useCallback(() => {
    if (isConnected) {
      setMenuOpen((open) => !open)
      return
    }
    setModalOpen(true)
  }, [isConnected])

  const handleCopy = useCallback(async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setMenuOpen(false)
  }, [address])

  const handleDisconnect = useCallback(() => {
    disconnect()
    setMenuOpen(false)
  }, [disconnect])

  const displayAddress = truncateAddress(address)

  return (
    <>
      <div ref={menuRef} className={cn('relative', className)}>
        <button
          type="button"
          onClick={handleChipClick}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5',
            'transition-all duration-200',
            isConnected
              ? 'border-orange-primary/25 bg-orange-primary/8 hover:border-orange-primary/35'
              : 'border-border-subtle glass-surface-light hover:border-border-default',
          )}
          aria-expanded={isConnected ? menuOpen : undefined}
          aria-haspopup={isConnected ? 'menu' : undefined}
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
              {isConnected ? displayAddress : 'Connect Wallet'}
            </span>
          </div>
          {isConnected ? (
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 text-text-muted transition-transform duration-200',
                menuOpen && 'rotate-180',
              )}
              aria-hidden="true"
            />
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-wider text-orange-warm">
              Connect
            </span>
          )}
        </button>

        {isConnected && menuOpen && (
          <div
            className={cn(
              'absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl',
              'border border-border-default glass-surface-strong',
              'shadow-[0_16px_48px_rgba(0,0,0,0.55)]',
            )}
            role="menu"
          >
            <div className="border-b border-border-subtle px-3 py-2.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-faint">
                Connected
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-text-primary">{displayAddress}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-md p-1 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text-primary"
                  aria-label="Copy address"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-1">
              {address && (
                <a
                  href={sepoliaExplorerUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-text-secondary',
                    'transition-colors hover:bg-white/[0.04] hover:text-text-primary',
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  View on Etherscan
                </a>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={handleDisconnect}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs',
                  'text-status-error transition-colors hover:bg-status-errorMuted',
                )}
              >
                <LogOut className="h-3.5 w-3.5 shrink-0 opacity-80" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>

      <ConnectWalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
