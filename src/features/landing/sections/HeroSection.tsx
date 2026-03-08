import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { BeamButton } from '@/components/ui/BeamButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { StatusPill } from '@/components/ui/StatusPill'
import { ProtocolChip } from '@/components/marketing/ProtocolChip'
import { Container } from '@/components/ui/Container'
import { HERO_CHIPS, LANDING_LINKS } from '@/features/landing/data'

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4.25rem)] flex-col justify-center overflow-hidden pb-8 pt-16 lg:pt-20">
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-8 flex justify-center">
            <StatusPill label="Private Execution Layer — Sepolia Testnet Live" variant="pending" />
          </div>

          <h1 className="text-hero font-heading text-text-primary">
            Trade Without{' '}
            <span className="text-gradient-orange">Revealing.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-body-lg text-text-secondary">
            Orders enter as cryptographic commitments. Zero-knowledge proofs guarantee
            honest matching. Settlement is atomic, final, and on-chain.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={LANDING_LINKS.launchApp}>
              <BeamButton size="lg">
                Launch App
                <ArrowRight className="h-4 w-4" />
              </BeamButton>
            </Link>
            <Link to={LANDING_LINKS.readCircuit}>
              <GhostButton size="lg" className="rounded-pill border border-border-subtle px-7">
                Read the Circuit
              </GhostButton>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
            {HERO_CHIPS.map((chip) => (
              <ProtocolChip key={chip.label} label={chip.label} icon={chip.icon} />
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
