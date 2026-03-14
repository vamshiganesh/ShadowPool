import { CommitmentDetailDrawer } from '@/features/trade/overlays/CommitmentDetailDrawer'
import { ProofInspectorModal } from '@/features/proof-inspector/ProofInspectorModal'

export function AppOverlays() {
  return (
    <>
      <CommitmentDetailDrawer />
      <ProofInspectorModal />
    </>
  )
}
