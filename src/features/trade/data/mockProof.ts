export interface ProofInspectorData {
  proofSystem: string
  circuit: string
  constraints: number
  blockHeight: number
  generationTime: string
  verified: boolean
  library: string
  curve: string
  publicInputs: number
  rawProof: Record<string, unknown>
  publicSignals: string[]
  constraintBreakdown: {
    label: string
    count: number
    color: string
  }[]
}

export const MOCK_PROOF: ProofInspectorData = {
  proofSystem: 'Groth16',
  circuit: 'shadowpool_match.circom',
  constraints: 1_746,
  blockHeight: 7234891,
  generationTime: '8.4s',
  verified: true,
  library: 'snarkjs v0.5.0',
  curve: 'bn128',
  publicInputs: 4,
  rawProof: {
    proof: {
      pi_a: [
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
        '1768176890853816492787496509785858670207456849653836939859321974427077492635',
        '1',
      ],
      pi_b: [
        [
          '198414835196978391760258210219907205078554153399657130056090573963016898423',
          '133111561097702372083861234916715757247697649619136230657191048041503082883',
        ],
        [
          '21888242871839275222246405745257275088548364400416034343698204186575808495617',
          '1094412143591963761234540597247897574335936896789429425262019494954675926060374',
        ],
        ['1', '0'],
      ],
      pi_c: [
        '15821847117103286449888577380388645511401297134273222608534504539441032907',
        '2081904533764076759560883312933598830937077017229079787261118853958124026881',
        '1',
      ],
      protocol: 'groth16',
      curve: 'bn128',
    },
  },
  publicSignals: [
    '0x4a3f9d8e7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2',
    '0x8f2a91c3e7b5d4f2a1c0e9d8b7a6f5e4d3c2b1a0',
    '3421500000',
    '1',
  ],
  constraintBreakdown: [
    { label: 'Poseidon Hash', count: 6200, color: '#C4390F' },
    { label: 'Range Checks', count: 4100, color: '#B76653' },
    { label: 'Price Validation', count: 3800, color: '#AA2608' },
    { label: 'Signature Verify', count: 2800, color: 'rgba(245,240,238,0.2)' },
    { label: 'Nullifier', count: 1532, color: 'rgba(245,240,238,0.1)' },
  ],
}
