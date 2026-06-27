import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { BeamLink } from '@/components/ui/BeamButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { LANDING_LINKS } from '@/features/landing/data'


export function FinalCTASection() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-border-default glass-surface-strong px-8 py-16 text-center lg:px-16 lg:py-20"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(196, 57, 15, 0.2) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          <div className="relative">
            <h2 className="font-heading text-page-headline text-text-primary">
              Execute privately.{' '}
              <span className="text-gradient-orange">Prove publicly.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-text-secondary">
              Join the protocol where order intent stays hidden until settlement is
              cryptographically verified.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BeamLink to={LANDING_LINKS.launchApp} size="lg" arrowBadge>
                Launch App
              </BeamLink>
              <Link to={LANDING_LINKS.protocol}>
                <GhostButton size="lg" className="rounded-pill border border-border-subtle px-7">
                  Read Protocol Docs
                </GhostButton>
              </Link>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
