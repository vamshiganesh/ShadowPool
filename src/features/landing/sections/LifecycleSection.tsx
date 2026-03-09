import { Check, Circle, Cpu } from 'lucide-react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { LIFECYCLE_STAGES } from '@/features/landing/data'
import { cn } from '@/lib/utils/cn'

export function LifecycleSection() {
  return (
    <section className="border-y border-border-subtle bg-bg-elevated/20 py-20 lg:py-24">
      <Container>
        <MonoLabel variant="accent" size="micro" className="mb-10 block text-center">
          Order Lifecycle
        </MonoLabel>

        <div className="relative mx-auto max-w-4xl">
          {/* Progress track */}
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-border-subtle md:block" />
          <div
            className="absolute left-0 top-5 hidden h-px bg-gradient-to-r from-orange-primary to-orange-warm/50 md:block"
            style={{ width: '42%' }}
          />

          <div className="grid grid-cols-3 gap-6 md:grid-cols-6 md:gap-0">
            {LIFECYCLE_STAGES.map((stage, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col items-center"
              >
                <StageNode status={stage.status} id={stage.id} />
                <p
                  className={cn(
                    'mt-3 font-mono text-[10px] uppercase tracking-wider',
                    stage.status === 'active'
                      ? 'text-orange-warm'
                      : stage.status === 'complete'
                        ? 'text-text-muted'
                        : 'text-text-faint',
                  )}
                >
                  {stage.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

function StageNode({ status, id }: { status: 'complete' | 'active' | 'pending'; id: string }) {
  if (status === 'complete') {
    return (
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-orange-primary/30 bg-orange-primary/15">
        <Check className="h-4 w-4 text-orange-warm" />
      </div>
    )
  }

  if (status === 'active') {
    return (
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-orange-primary bg-orange-primary/20 shadow-glow">
        <span className="h-2 w-2 rounded-full bg-orange-primary animate-pulse-glow" />
      </div>
    )
  }

  return (
    <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-surface">
      {id === 'proof' ? (
        <Cpu className="h-3.5 w-3.5 text-text-faint" />
      ) : (
        <Circle className="h-3 w-3 text-text-faint" />
      )}
    </div>
  )
}
