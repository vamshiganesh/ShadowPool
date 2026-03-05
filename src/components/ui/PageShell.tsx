import { SectionHeading } from '@/components/ui/SectionHeading'
import { GlassCard } from '@/components/ui/GlassCard'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { Divider } from '@/components/ui/Divider'
import { cn } from '@/lib/utils/cn'

interface PageShellProps {
  title: string
  description?: string
  eyebrow?: string
  layout?: 'marketing' | 'app' | 'docs'
  headingSize?: 'hero' | 'page' | 'section'
}

export function PageShell({
  title,
  description,
  eyebrow = 'Phase scaffold',
  layout = 'marketing',
  headingSize,
}: PageShellProps) {
  const size = headingSize ?? (layout === 'marketing' ? 'page' : layout === 'docs' ? 'page' : 'section')
  const padding = layout === 'app' ? 'p-6 lg:p-8' : layout === 'docs' ? '' : 'py-20'

  return (
    <div className={cn(padding)}>
      {layout === 'docs' ? (
        <div className="space-y-6 animate-fade-in">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description ?? 'This screen will be implemented in a subsequent build phase.'}
            size={size}
          />
          <Divider spacing="lg" />
          <MonoLabel variant="faint" size="micro">
            Route scaffold · Part 3 shell
          </MonoLabel>
        </div>
      ) : (
        <div className={layout === 'marketing' ? 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8' : ''}>
          <GlassCard className="animate-fade-in" padding="lg">
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              description={description ?? 'This screen will be implemented in a subsequent build phase.'}
              size={size}
            />
            <Divider spacing="md" className="mt-8" />
            <MonoLabel variant="faint" size="micro">
              Route scaffold · Part 3 shell
            </MonoLabel>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
