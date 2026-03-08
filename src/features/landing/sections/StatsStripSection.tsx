import { STATS_STRIP } from '@/features/landing/data'
import { Container } from '@/components/ui/Container'
import { Divider } from '@/components/ui/Divider'

export function StatsStripSection() {
  return (
    <section className="border-b border-border-subtle py-12">
      <Container>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0 md:divide-x md:divide-border-subtle">
          {STATS_STRIP.map((stat, i) => (
            <div
              key={stat.label}
              className={i > 0 ? 'md:pl-8' : ''}
            >
              <p className="font-heading text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-text-faint">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
      <Divider spacing="none" className="mt-12 hidden md:block" />
    </section>
  )
}
