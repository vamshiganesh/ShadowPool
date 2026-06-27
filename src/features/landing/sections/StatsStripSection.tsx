import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { STATS_STRIP } from '@/features/landing/data'
import { Container } from '@/components/ui/Container'
import { Divider } from '@/components/ui/Divider'
import { cn } from '@/lib/utils/cn'

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function StatsStripParticles() {
  const reduceMotion = useReducedMotion()

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: seededRandom(i * 1.7) * 100,
        y: seededRandom(i * 2.9) * 100,
        size: seededRandom(i * 4.1) * 2.5 + 2.5,
        opacity: seededRandom(i * 5.3) * 0.14 + 0.18,
        delay: seededRandom(i * 6.7) * 10,
        duration: seededRandom(i * 7.9) * 12 + 18,
      })),
    [],
  )

  if (reduceMotion) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-orange-warm shadow-[0_0_10px_rgba(196,57,15,0.45)] animate-stats-drift"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export function StatsStripSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden border-b border-border-subtle py-12">
      <StatsStripParticles />
      <Container className="relative z-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0 md:divide-x md:divide-border-subtle">
          {STATS_STRIP.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45, margin: '0px 0px -8% 0px' }}
              transition={{
                duration: 0.75,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(index > 0 && 'md:pl-8')}
            >
              <p className="font-heading text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-text-faint">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
      <Divider spacing="none" className="relative z-10 mt-12 hidden md:block" />
    </section>
  )
}
