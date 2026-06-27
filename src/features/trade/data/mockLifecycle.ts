export type LifecycleStageId = 'created' | 'onchain' | 'matched' | 'proof' | 'settled'

export interface LifecycleStage {
  id: LifecycleStageId
  label: string
  sublabel: string
}

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  { id: 'created', label: 'Created', sublabel: 'Commitment computed' },
  { id: 'onchain', label: 'On-Chain', sublabel: 'Hash submitted' },
  { id: 'matched', label: 'Matched', sublabel: 'Counterparty found' },
  { id: 'proof', label: 'Proof', sublabel: 'Groth16 generating' },
  { id: 'settled', label: 'Settled', sublabel: 'Atomic execution' },
]

export const DEFAULT_ACTIVE_STAGE: LifecycleStageId = 'created'
