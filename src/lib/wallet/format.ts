import type { Address } from 'viem'

export function truncateAddress(address: Address | undefined, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}

export function sepoliaExplorerUrl(address: Address): string {
  return `https://sepolia.etherscan.io/address/${address}`
}
