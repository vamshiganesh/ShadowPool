/**
 * Sepolia RPC URL for browser-side viem/wagmi clients.
 *
 * In dev, routes through the Vite proxy (/rpc/sepolia) to avoid Alchemy CORS.
 * In production, uses VITE_SEPOLIA_RPC_URL directly.
 */
export function getSepoliaRpcUrl(): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.origin}/rpc/sepolia`
  }

  return (
    import.meta.env.VITE_SEPOLIA_RPC_URL ||
    'https://ethereum-sepolia-rpc.publicnode.com'
  )
}
