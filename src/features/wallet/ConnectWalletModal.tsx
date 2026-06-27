import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { useConnect } from 'wagmi'
import type { Connector } from 'wagmi'
import { useOverlay } from '@/lib/hooks/useOverlay'
import { GhostButton } from '@/components/ui/GhostButton'
import { MetaMaskIcon, WalletConnectIcon } from '@/features/wallet/WalletIcons'
import { cn } from '@/lib/utils/cn'

interface WalletOption {
  connector: Connector
  name: string
  description: string
  icon: 'metamask' | 'walletconnect'
}

function isMetaMaskConnector(connector: Connector): boolean {
  return (
    connector.id === 'metaMaskSDK' ||
    connector.id === 'metaMask' ||
    connector.id === 'io.metamask' ||
    connector.name.toLowerCase().includes('metamask')
  )
}

function getWalletOptions(connectors: readonly Connector[]): WalletOption[] {
  const options: WalletOption[] = []

  const metaMaskConnector = connectors.find(isMetaMaskConnector)
  if (metaMaskConnector) {
    options.push({
      connector: metaMaskConnector,
      name: 'MetaMask',
      description: 'Browser extension',
      icon: 'metamask',
    })
  }

  const walletConnect = connectors.find((c) => c.id === 'walletConnect')
  if (walletConnect) {
    options.push({
      connector: walletConnect,
      name: 'WalletConnect',
      description: 'Mobile & hardware wallets',
      icon: 'walletconnect',
    })
  }

  return options
}

interface ConnectWalletModalProps {
  open: boolean
  onClose: () => void
}

export function ConnectWalletModal({ open, onClose }: ConnectWalletModalProps) {
  const { connect, connectors, isPending, error, reset } = useConnect()
  const { handleBackdropClick, containerRef } = useOverlay({ isOpen: open, onClose })
  const [pendingName, setPendingName] = useState('wallet')

  const walletOptions = getWalletOptions(connectors)

  const handlePick = useCallback(
    (option: WalletOption) => {
      reset()
      setPendingName(option.name)
      connect({ connector: option.connector })
    },
    [connect, reset],
  )

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-bg-base/80 backdrop-blur-md"
            onClick={isPending ? undefined : handleBackdropClick}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              ref={containerRef}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={cn(
                'w-full max-w-sm overflow-hidden rounded-2xl outline-none',
                'border border-border-default glass-surface-strong',
                'shadow-[0_24px_80px_rgba(0,0,0,0.65)]',
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="connect-wallet-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
                <h2
                  id="connect-wallet-title"
                  className="font-heading text-base font-semibold text-text-primary"
                >
                  {isPending ? 'Connecting…' : 'Connect Wallet'}
                </h2>
                {!isPending && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text-primary"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isPending ? (
                <div className="flex flex-col items-center px-6 py-10 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-emerald-400" aria-hidden="true" />
                  <p className="mt-5 text-sm font-medium text-text-primary">Waiting for wallet</p>
                  <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-text-muted">
                    Approve the connection request in {pendingName}
                  </p>
                  <GhostButton className="mt-8" onClick={handleClose}>
                    Cancel
                  </GhostButton>
                </div>
              ) : (
                <>
                  <div className="space-y-2 p-4">
                    {walletOptions.length === 0 ? (
                      <p className="px-2 py-6 text-center text-sm text-text-muted">
                        No wallet connectors available. Install MetaMask or set{' '}
                        <code className="text-orange-warm">VITE_WALLETCONNECT_PROJECT_ID</code>.
                      </p>
                    ) : (
                      walletOptions.map((option) => (
                        <button
                          key={option.connector.uid}
                          type="button"
                          onClick={() => handlePick(option)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl border border-border-subtle px-4 py-3.5 text-left',
                            'glass-surface-light transition-all duration-200',
                            'hover:border-border-default hover:bg-white/[0.04]',
                          )}
                        >
                          {option.icon === 'metamask' ? (
                            <MetaMaskIcon className="h-9 w-9 shrink-0" />
                          ) : (
                            <WalletConnectIcon className="h-9 w-9 shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-text-primary">{option.name}</p>
                            <p className="mt-0.5 text-xs text-text-muted">{option.description}</p>
                          </div>
                        </button>
                      ))
                    )}

                    {error && (
                      <p className="rounded-lg border border-status-error/30 bg-status-errorMuted px-3 py-2 text-xs text-status-error">
                        {error.message.length > 120
                          ? 'Connection failed. Try again or use another wallet.'
                          : error.message}
                      </p>
                    )}
                  </div>

                  <p className="border-t border-border-subtle px-5 py-3 text-center text-[11px] text-text-faint">
                    Connects to Sepolia testnet only
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
