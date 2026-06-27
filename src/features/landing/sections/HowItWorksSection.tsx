import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GlassCard } from '@/components/ui/GlassCard'
import { StepVisual } from '@/features/landing/components/HowItWorksStepVisuals'
import { HOW_IT_WORKS_STEPS } from '@/features/landing/data'
import { cn } from '@/lib/utils/cn'

export function HowItWorksSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="how-it-works" className="py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow="How It Works"
          title="Privacy-first execution, cryptographically guaranteed."
          description="A five-step path from private intent to verifiable on-chain settlement, preserving anonymity without sacrificing liquidity."
          align="center"
          size="page"
          className="mb-16"
        />

        <div className="space-y-8">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const fromLeft = index % 2 === 0

            return (
              <motion.div
                key={step.step}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: fromLeft ? -72 : 72 }
                }
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35, margin: '0px 0px -10% 0px' }}
                transition={{
                  duration: 2.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
              <GlassCard padding="none" className="overflow-hidden">
                <div
                  className={cn(
                    'grid items-center gap-0 lg:grid-cols-2',
                    index % 2 === 1 && 'lg:[&>*:first-child]:order-2',
                  )}
                >
                  <div className="p-8 lg:p-10">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-orange-warm">
                      Step {step.step}
                    </p>
                    <h3 className="mt-3 font-heading text-section-headline text-text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                      {step.description}
                    </p>
                  </div>

                  <div className="border-t border-border-subtle bg-bg-elevated/30 p-6 lg:border-t-0 lg:border-l lg:p-8">
                    <StepVisual type={step.visual} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
