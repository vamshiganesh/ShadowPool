import { useEffect, useRef, useState, type ComponentType } from 'react'
import {
  Check,
  Cpu,
  FileKey,
  GitMerge,
  Link2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { LIFECYCLE_STAGES } from '@/features/landing/data'
import { cn } from '@/lib/utils/cn'

const STAGE_COUNT = LIFECYCLE_STAGES.length
const ANIMATION_DURATION = 5

const STAGE_ICONS: Record<(typeof LIFECYCLE_STAGES)[number]['id'], ComponentType<{ className?: string }>> = {
  created: FileKey,
  onchain: Link2,
  matched: GitMerge,
  proof: Cpu,
  verified: ShieldCheck,
  settled: Sparkles,
}

/** Progress (0–1) within the current segment when icon hands off to checkmark */
const CHECK_HANDOFF_START = 0.62
const CHECK_HANDOFF_END = 0.82

type NodeVisual =
  | { kind: 'pending' }
  | { kind: 'complete' }
  | { kind: 'frontier'; segmentT: number }

function getNodeVisual(index: number, progress: number): NodeVisual {
  if (progress < 0) return { kind: 'pending' }
  if (progress >= 100) return { kind: 'complete' }

  const scaled = (progress / 100) * (STAGE_COUNT - 1)
  const completedCount = Math.floor(scaled)
  const segmentT = scaled - completedCount

  if (index < completedCount) return { kind: 'complete' }
  if (index > completedCount) return { kind: 'pending' }
  return { kind: 'frontier', segmentT }
}

function getLabelTone(visual: NodeVisual): 'active' | 'complete' | 'pending' {
  if (visual.kind === 'complete') return 'complete'
  if (visual.kind === 'pending') return 'pending'
  if (visual.segmentT >= CHECK_HANDOFF_END) return 'complete'
  return 'active'
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function handoffMix(segmentT: number) {
  return clamp01((segmentT - CHECK_HANDOFF_START) / (CHECK_HANDOFF_END - CHECK_HANDOFF_START))
}

export function LifecycleSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-12% 0px' })
  const reducedMotion = useReducedMotion()
  const [progress, setProgress] = useState(-1)

  useEffect(() => {
    if (!isInView) return

    if (reducedMotion) {
      setProgress(100)
      return
    }

    setProgress(0)
    const controls = animate(0, 100, {
      duration: ANIMATION_DURATION,
      ease: 'linear',
      onUpdate: (value) => setProgress(value),
    })

    return () => controls.stop()
  }, [isInView, reducedMotion])

  return (
    <section className="border-y border-border-subtle bg-bg-elevated/20 py-20 lg:py-24">
      <Container>
        <MonoLabel variant="accent" size="micro" className="mb-10 block text-center">
          Order Lifecycle
        </MonoLabel>

        <div ref={containerRef} className="relative mx-auto max-w-4xl">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-border-subtle md:block" />

          <motion.div
            className="absolute left-0 top-5 hidden h-px origin-left bg-gradient-to-r from-orange-primary via-orange-warm to-orange-primary/70 md:block"
            style={{ width: `${Math.max(0, progress)}%` }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-3 gap-6 md:grid-cols-6 md:gap-0">
            {LIFECYCLE_STAGES.map((stage, i) => {
              const visual = getNodeVisual(i, progress)
              const labelTone = getLabelTone(visual)

              return (
                <div key={stage.id} className="flex flex-col items-center">
                  <StageNode stageId={stage.id} visual={visual} />
                  <p
                    className={cn(
                      'mt-3 font-mono text-[10px] uppercase tracking-wider transition-colors duration-150',
                      labelTone === 'active'
                        ? 'text-orange-warm'
                        : labelTone === 'complete'
                          ? 'text-text-muted'
                          : 'text-text-faint',
                    )}
                  >
                    {stage.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}

function StageNode({
  stageId,
  visual,
}: {
  stageId: (typeof LIFECYCLE_STAGES)[number]['id']
  visual: NodeVisual
}) {
  const Icon = STAGE_ICONS[stageId]

  if (visual.kind === 'pending') {
    return (
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-surface">
        <Icon className="h-3.5 w-3.5 text-text-faint" />
      </div>
    )
  }

  if (visual.kind === 'complete') {
    return (
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-orange-primary/30 bg-orange-primary/15">
        <Check className="h-4 w-4 text-orange-warm" />
      </div>
    )
  }

  const mix = handoffMix(visual.segmentT)
  const iconOpacity = 1 - mix
  const iconScale = 1 - mix * 0.45
  const checkOpacity = mix
  const checkScale = 0.35 + mix * 0.65
  const isApproaching = mix < 0.08

  return (
    <div
      className={cn(
        'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-[border-color,background-color,box-shadow] duration-75',
        mix > 0.35
          ? 'border-orange-primary/30 bg-orange-primary/15'
          : isApproaching
            ? 'border-orange-primary bg-orange-primary/20 shadow-glow'
            : 'border-border-subtle bg-bg-surface',
      )}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: iconOpacity, transform: `scale(${iconScale})` }}
      >
        <Icon
          className={cn(
            'h-3.5 w-3.5',
            isApproaching ? 'text-orange-warm' : 'text-text-faint',
          )}
        />
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: checkOpacity, transform: `scale(${checkScale})` }}
      >
        <Check className="h-4 w-4 text-orange-warm" />
      </div>
    </div>
  )
}
