import { TradingAppPreview } from '@/features/landing/TradingAppPreview'
import { Container } from '@/components/ui/Container'

export function ProductPreviewSection() {
  return (
    <section className="relative -mt-4 pb-20 pt-4 lg:-mt-8">
      <Container>
        <TradingAppPreview />
      </Container>
    </section>
  )
}
