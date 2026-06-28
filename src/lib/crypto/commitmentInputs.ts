export interface OrderInput {
  assetAmount: bigint // 18 decimal fixed-point (ETH)
  limitPrice: bigint // 6 decimal fixed-point (USDC)
  nonce: bigint // random 128-bit integer
  salt: bigint // uint256 entropy
}

/** Generate a secure random 128-bit nonce. */
export function generateNonce(): bigint {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return BigInt(
    '0x' + Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join(''),
  )
}

/** Generate a secure random uint256 salt. */
export function generateSalt(): bigint {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return BigInt(
    '0x' + Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join(''),
  )
}
