import { MobileDeviceFrame } from '@/features/mobile/MobileDeviceFrame'
import { MobileTradeScreen } from '@/features/mobile/MobileTradeScreen'
import { AppOverlays } from '@/components/trading/AppOverlays'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function MobileTradeShowcase() {
  return (
    <>
      <section className="py-12 sm:py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Mobile Terminal"
            title="Trade on any device."
            description="A purpose-built mobile interface — not a shrunk desktop layout."
            align="center"
            size="page"
            className="mb-10 sm:mb-14"
          />
          <MobileDeviceFrame>
            <MobileTradeScreen />
          </MobileDeviceFrame>
        </Container>
      </section>
      <AppOverlays />
    </>
  )
}
