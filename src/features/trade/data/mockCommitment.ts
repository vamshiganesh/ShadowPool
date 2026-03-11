export interface CommitmentDetail {
  hash: string
  status: 'settled' | 'proving' | 'matched' | 'on-chain'
  proofSystem: string
  blockHeight: number
  pair: string
  direction: 'buy' | 'sell'
  size: string
  price: string
  notional: string
  provingSystem: string
  constraints: number
  rawProof: Record<string, unknown>
  settlementTx: string
  settlementBlock: number
  gasUsed: string
}

export const MOCK_COMMITMENT: CommitmentDetail = {
  hash: '0x4a3f9d8e7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2',
  status: 'settled',
  proofSystem: 'Groth16',
  blockHeight: 7234891,
  pair: 'ETH / USDC',
  direction: 'buy',
  size: '2.5000 ETH',
  price: '3,421.50 USDC',
  notional: '8,553.75 USDC',
  provingSystem: 'Groth16_BN254',
  constraints: 18432,
  rawProof: {
    pi_a: ['0x2c4f7e1a9b3d8c5f6a2e1d0c9b8a7f6e5d4c3b2a1', '0x8f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6', '1'],
    pi_b: [
      ['0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2', '0x9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4'],
      ['0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3', '0x7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2'],
      ['1', '0'],
    ],
    pi_c: ['0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4', '0x6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1', '1'],
  },
  settlementTx: '0x4e7bf21a9c3d8e5f6a2b1c0d9e8f7a6b5c4d3e2f1',
  settlementBlock: 7234891,
  gasUsed: '142,318',
}
