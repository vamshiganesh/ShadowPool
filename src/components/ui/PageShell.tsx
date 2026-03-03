import { Container } from '@/components/ui/Container'
import { GlassCard } from '@/components/ui/GlassCard'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { SectionHeading } from '@/components/ui/SectionHeading'

interface PageShellProps {
  title: string
  description?: string
  eyebrow?: string
  layout?: 'marketing' | 'app' | 'docs'
}

export function PageShell({
  title,
  description,
  eyebrow = 'Coming Soon',
  layout = 'marketing',
}: PageShellProps) {
  const padding = layout === 'marketing' ? 'py-20' : 'p-6 lg:p-8'

  return (
    <div className={padding}>
      <Container size={layout === 'docs' ? 'narrow' : 'default'}>
        <GlassCard className="animate-fade-in">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description ?? 'This screen will be implemented in a subsequent build phase.'}
          />
          <div className="mt-8 flex items-center gap-3 border-t border-border-subtle pt-6">
            <MonoLabel variant="muted">Route scaffold</MonoLabel>
            <MonoLabel variant="accent">Phase 2 foundation</MonoLabel>
          </div>
        </GlassCard>
      </Container>
    </div>
  )
}
