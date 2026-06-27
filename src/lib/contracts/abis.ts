export const ORDER_BOOK_ABI = [
  {
    type: 'event',
    name: 'CommitmentSubmitted',
    inputs: [
      { name: 'commitment', type: 'bytes32', indexed: true },
      { name: 'trader', type: 'address', indexed: true },
      { name: 'blockNumber', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CommitmentSettled',
    inputs: [
      { name: 'commitment', type: 'bytes32', indexed: true },
      { name: 'trader', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'CommitmentCancelled',
    inputs: [
      { name: 'commitment', type: 'bytes32', indexed: true },
      { name: 'trader', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'EscrowReleased',
    inputs: [
      { name: 'commitment', type: 'bytes32', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'submitCommitment',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'cancelCommitment',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'getOpenCommitments',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
  {
    name: 'getEscrow',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [
      { name: 'trader', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  {
    name: 'statusOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'commitmentCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const SETTLEMENT_ABI = [
  {
    type: 'event',
    name: 'OrdersSettled',
    inputs: [
      { name: 'commitmentA', type: 'bytes32', indexed: true },
      { name: 'commitmentB', type: 'bytes32', indexed: true },
      { name: 'clearingPrice', type: 'uint256', indexed: false },
      { name: 'traderA', type: 'address', indexed: false },
      { name: 'traderB', type: 'address', indexed: false },
      { name: 'settledBlock', type: 'uint256', indexed: false },
    ],
  },
] as const

/** OrderBook.OrderStatus enum */
export const ORDER_STATUS = {
  None: 0,
  OnChain: 1,
  Matched: 2,
  Settled: 3,
  Cancelled: 4,
} as const
