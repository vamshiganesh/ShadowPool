import { MobileDeviceFrame } from '@/features/mobile/MobileDeviceFrame'
import { MobileTradeScreen } from '@/features/mobile/MobileTradeScreen'
import { CommitmentDetailDrawer } from '@/features/trade/overlays/CommitmentDetailDrawer'
import { ProofInspectorModal } from '@/features/proof-inspector/ProofInspectorModal'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function MobileTradeShowcase() {
  return (
    <>
      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Mobile Terminal"
            title="Trade on any device."
            description="A purpose-built mobile interface — not a shrunk desktop layout."
            align="center"
            size="page"
            className="mb-14"
          />
          <MobileDeviceFrame>
            <MobileTradeScreen />
          </MobileDeviceFrame>
        </Container>
      </section>
      <CommitmentDetailDrawer />
      <ProofInspectorModal />
    </>
  )
}
