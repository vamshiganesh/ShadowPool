import { LIFECYCLE_STAGES, type LifecycleStageId } from '@/features/trade/data/mockLifecycle'
import { MonoLabel } from '@/components/ui/MonoLabel'
import { cn } from '@/lib/utils/cn'

interface LifecycleStepperProps {
  activeStage: LifecycleStageId
  orientation?: 'vertical' | 'horizontal'
  compact?: boolean
  className?: string
}

const stageOrder = LIFECYCLE_STAGES.map((s) => s.id)

function getStageStatus(
  stageId: LifecycleStageId,
  activeStage: LifecycleStageId,
): 'complete' | 'active' | 'pending' {
  const activeIdx = stageOrder.indexOf(activeStage)
  const stageIdx = stageOrder.indexOf(stageId)
  if (stageIdx < activeIdx) return 'complete'
  if (stageIdx === activeIdx) return 'active'
  return 'pending'
}

export function LifecycleStepper({
  activeStage,
  orientation = 'vertical',
  compact = false,
  className,
}: LifecycleStepperProps) {
  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-center justify-between gap-1', className)}>
        {LIFECYCLE_STAGES.map((stage) => {
          const status = getStageStatus(stage.id, activeStage)
          return (
            <div key={stage.id} className="flex flex-1 flex-col items-center">
              <StepDot status={status} />
              <p
                className={cn(
                  'mt-1.5 font-mono text-[9px] uppercase tracking-wider',
                  status === 'active' ? 'text-orange-warm' : 'text-text-faint',
                )}
              >
                {stage.label}
              </p>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      <MonoLabel variant="muted" size="micro" className="mb-4 block">
        Order Lifecycle
      </MonoLabel>
      {LIFECYCLE_STAGES.map((stage, i) => {
        const status = getStageStatus(stage.id, activeStage)
        const isLast = i === LIFECYCLE_STAGES.length - 1

        return (
          <div key={stage.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepDot status={status} />
              {!isLast && (
                <div
                  className={cn(
                    'my-1 w-px flex-1 min-h-[20px]',
                    status === 'complete' ? 'bg-orange-primary/40' : 'bg-border-subtle',
                  )}
                />
              )}
            </div>
            <div className={cn('pb-5', isLast && 'pb-0')}>
              <p
                className={cn(
                  'font-mono text-[11px] uppercase tracking-wider',
                  status === 'active'
                    ? 'text-orange-warm'
                    : status === 'complete'
                      ? 'text-text-muted'
                      : 'text-text-faint',
                )}
              >
                {stage.label}
              </p>
              {!compact && (
                <p className="mt-0.5 text-[11px] text-text-faint">{stage.sublabel}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StepDot({ status }: { status: 'complete' | 'active' | 'pending' }) {
  return (
    <div
      className={cn(
        'relative z-10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full',
        status === 'complete' && 'bg-orange-primary/60',
        status === 'active' && 'bg-orange-primary shadow-glow animate-pulse-glow',
        status === 'pending' && 'border border-border-subtle bg-bg-surface',
      )}
    >
      {status === 'active' && (
        <span className="h-1.5 w-1.5 rounded-full bg-text-primary" />
      )}
    </div>
  )
}
