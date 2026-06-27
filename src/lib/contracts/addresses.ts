import raw from '../../../shared/addresses.json'

export interface ProtocolAddresses {
  verifier: `0x${string}`
  orderBook: `0x${string}`
  settlement: `0x${string}`
  network: string
  chainId: number
  deployBlock?: number
}

const ZERO = '0x0000000000000000000000000000000000000000'

export const addresses = raw as ProtocolAddresses

export function isZeroAddress(addr: string): boolean {
  return !addr || addr.toLowerCase() === ZERO.toLowerCase()
}

export function areContractsDeployed(): boolean {
  return (
    !isZeroAddress(addresses.orderBook) &&
    !isZeroAddress(addresses.settlement) &&
    !isZeroAddress(addresses.verifier)
  )
}

export const SEPOLIA_ETHERSCAN = 'https://sepolia.etherscan.io'

export function etherscanTxUrl(txHash: string): string {
  return `${SEPOLIA_ETHERSCAN}/tx/${txHash}`
}

export function etherscanAddressUrl(addr: string): string {
  return `${SEPOLIA_ETHERSCAN}/address/${addr}`
}
