/** Circuit metadata — aligned with circuits/shadowpool_match.circom compile output (~1,746 constraints). */
export const CIRCUIT_META = {
  name: 'shadowpool_match.circom',
  constraints: 1_746,
  provingSystem: 'Groth16',
  curve: 'bn128',
  library: 'snarkjs',
  publicInputs: 3,
  constraintBreakdown: [
    { label: 'Poseidon Hash', count: 1_120, color: '#C4390F' },
    { label: 'Price Validation', count: 320, color: '#AA2608' },
    { label: 'Range Checks', count: 246, color: '#B76653' },
    { label: 'Match Logic', count: 60, color: 'rgba(245,240,238,0.2)' },
  ],
} as const
