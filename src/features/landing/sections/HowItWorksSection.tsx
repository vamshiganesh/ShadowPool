import { motion } from 'framer-motion'
import { Check, Cpu, Diamond, Lock } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GlassCard } from '@/components/ui/GlassCard'
import { CodePanel } from '@/components/marketing/CodePanel'
import { InlineCodePill } from '@/components/ui/InlineCodePill'
import { COMMITMENT_CODE, HOW_IT_WORKS_STEPS } from '@/features/landing/data'
import { cn } from '@/lib/utils/cn'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow="How It Works"
          title="Privacy-first execution, cryptographically guaranteed."
          description="A five-step path from private intent to verifiable on-chain settlement — preserving anonymity without sacrificing liquidity."
          align="center"
          size="page"
          className="mb-16"
        />

        <div className="space-y-8">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
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
          ))}
        </div>
      </Container>
    </section>
  )
}

function StepVisual({ type }: { type: (typeof HOW_IT_WORKS_STEPS)[number]['visual'] }) {
  switch (type) {
    case 'code':
      return <CodePanel code={COMMITMENT_CODE} language="rust" />
    case 'hash':
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-bg-base/60 py-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-orange-primary/30 bg-orange-primary/10">
            <Lock className="h-5 w-5 text-orange-warm" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            Commitment Hash Submitted
          </p>
          <InlineCodePill className="mt-3 text-sm">0x8f2a…c93b</InlineCodePill>
        </div>
      )
    case 'matcher':
      return (
        <div className="flex items-center justify-center gap-4 py-6">
          <OrderNode label="Order A" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-px w-8 bg-border-default" />
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-orange-primary/40 bg-orange-primary/15 shadow-glow">
              <Diamond className="h-5 w-5 text-orange-warm" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-orange-warm">
              Matched
            </span>
            <div className="h-px w-8 bg-border-default" />
          </div>
          <OrderNode label="Order B" />
        </div>
      )
    case 'proof':
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-bg-base/60 py-10">
          <Cpu className="h-8 w-8 text-orange-warm opacity-80" />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-text-faint">
            Generating Groth16 Proof
          </p>
          <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-border-subtle">
            <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-orange-deep to-orange-primary animate-pulse-glow" />
          </div>
          <p className="mt-2 font-mono text-[11px] text-text-muted">~8.4s avg</p>
        </div>
      )
    case 'settlement':
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-emerald-400/80">
            Atomic Settlement Complete
          </p>
          <InlineCodePill className="mt-3">tx 0x4e7b…f21a</InlineCodePill>
        </div>
      )
    default:
      return null
  }
}

function OrderNode({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border-subtle glass-surface-light px-4 py-3 text-center">
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">{label}</p>
      <p className="mt-1 font-mono text-xs text-text-secondary">committed</p>
    </div>
  )
}
