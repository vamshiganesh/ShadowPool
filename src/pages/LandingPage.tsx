import {
  HeroSection,
  ProductPreviewSection,
  LandingTickerSection,
  StatsStripSection,
  HowItWorksSection,
  LifecycleSection,
  FinalCTASection,
  FooterSection,
} from '@/features/landing'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProductPreviewSection />
      <LandingTickerSection />
      <StatsStripSection />
      <HowItWorksSection />
      <LifecycleSection />
      <FinalCTASection />
      <FooterSection />
    </>
  )
}
