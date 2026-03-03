import { PageShell } from '@/components/ui/PageShell'

export function StatsPage() {
  return (
    <PageShell
      title="Protocol Statistics"
      description="Inspect volume, proof throughput, and settlement metrics."
      eyebrow="Stats"
      layout="app"
    />
  )
}
