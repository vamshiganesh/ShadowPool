import {
  useCallback,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const BEAM_ARC = 42
const EXPAND_MS = 650

type BeamShape = 'pill' | 'rounded'

const shapeClasses: Record<BeamShape, string> = {
  pill: 'rounded-pill',
  rounded: 'rounded-xl',
}

interface BeamWrapperProps {
  children: ReactNode
  className?: string
  shape?: BeamShape
}

function readRotationDegrees(el: HTMLElement): number {
  const computed = getComputedStyle(el)
  const rotate = computed.rotate
  if (rotate && rotate !== 'none') {
    const value = parseFloat(rotate)
    if (!Number.isNaN(value)) return value
  }

  const transform = computed.transform
  if (!transform || transform === 'none') return 0
  const matrix = new DOMMatrix(transform)
  return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

type BeamPhase = 'idle' | 'expanding' | 'full'

/**
 * Border-beam: idle traveling arc + hover ring revealed clockwise via mask sweep.
 */
export function BeamWrapper({ children, className, shape = 'pill' }: BeamWrapperProps) {
  const idleBeamRef = useRef<HTMLDivElement>(null)
  const hoverRingRef = useRef<HTMLDivElement>(null)
  const expandFrameRef = useRef(0)
  const hoveredRef = useRef(false)
  const [phase, setPhase] = useState<BeamPhase>('idle')
  const [frozenRotation, setFrozenRotation] = useState(0)

  const cancelExpand = useCallback(() => {
    if (expandFrameRef.current) {
      cancelAnimationFrame(expandFrameRef.current)
      expandFrameRef.current = 0
    }
  }, [])

  const resetBeam = useCallback(() => {
    cancelExpand()
    const ring = hoverRingRef.current
    if (ring) {
      ring.style.removeProperty('rotate')
      ring.style.setProperty('--mask-sweep', `${BEAM_ARC}deg`)
    }
  }, [cancelExpand])

  const handleEnter = useCallback(() => {
    const idleBeam = idleBeamRef.current
    const hoverRing = hoverRingRef.current
    if (!idleBeam || !hoverRing) return

    hoveredRef.current = true
    cancelExpand()

    const angle = readRotationDegrees(idleBeam)
    setFrozenRotation(angle)

    hoverRing.style.setProperty('--mask-sweep', `${BEAM_ARC}deg`)
    hoverRing.style.rotate = `${angle}deg`
    setPhase('expanding')

    const start = performance.now()
    const tick = (now: number) => {
      if (!hoveredRef.current) return

      const progress = Math.min(1, (now - start) / EXPAND_MS)
      const sweep = BEAM_ARC + (360 - BEAM_ARC) * easeOutCubic(progress)
      hoverRing.style.setProperty('--mask-sweep', `${sweep}deg`)

      if (progress < 1) {
        expandFrameRef.current = requestAnimationFrame(tick)
      } else {
        hoverRing.style.setProperty('--mask-sweep', '360deg')
        expandFrameRef.current = 0
        setPhase('full')
      }
    }

    expandFrameRef.current = requestAnimationFrame(tick)
  }, [cancelExpand])

  const handleLeave = useCallback(() => {
    hoveredRef.current = false
    resetBeam()
    setPhase('idle')
  }, [resetBeam])

  const hoverRingStyle: CSSProperties =
    phase === 'full'
      ? {
          ['--mask-sweep' as string]: '360deg',
          ['--beam-start' as string]: `${frozenRotation}deg`,
        }
      : phase === 'expanding'
        ? { rotate: `${frozenRotation}deg` }
        : {}

  return (
    <div
      className={cn(
        'relative inline-flex overflow-hidden p-[2.5px]',
        shapeClasses[shape],
        className,
      )}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-[#180904]',
          shapeClasses[shape],
        )}
        aria-hidden="true"
      />

      <div
        ref={idleBeamRef}
        className={cn(
          'beam-layer pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 motion-reduce:animate-none',
          phase === 'idle' && 'animate-beam-rotate',
          phase !== 'idle' && 'opacity-0',
        )}
        aria-hidden="true"
      />

      <div
        ref={hoverRingRef}
        className={cn(
          'beam-hover-ring pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 motion-reduce:animate-none',
          phase === 'idle' && 'opacity-0',
          phase !== 'idle' && 'opacity-100',
          phase === 'full' && 'animate-beam-rotate-slow',
        )}
        style={hoverRingStyle}
        aria-hidden="true"
      />

      <div className={cn('relative z-10', shapeClasses[shape])}>{children}</div>
    </div>
  )
}

const sizeClasses = {
  sm: 'h-9 px-5 text-xs',
  md: 'h-11 px-7 text-sm',
  lg: 'h-12 px-9 text-base',
}

const badgeSizeClasses = {
  sm: 'gap-2 py-1.5 pl-4 pr-1.5 text-sm',
  md: 'gap-2 py-2 pl-6 pr-1.5 text-sm',
  lg: 'min-h-12 gap-2.5 py-1.5 pl-8 pr-1.5 text-base',
}

type BeamSize = keyof typeof sizeClasses

export function LaunchArrowBadge({ size = 'md' }: { size?: BeamSize }) {
  const box =
    size === 'lg' ? 'h-10 w-10 rounded-xl' : size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-lg'
  const icon = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center bg-white/15 transition-colors group-hover:bg-white/20',
        box,
      )}
    >
      <ArrowRight className={icon} />
    </span>
  )
}

export const beamButtonClasses = cn(
  'inline-flex items-center justify-center font-medium tracking-wide',
  'bg-gradient-to-b from-orange-primary to-orange-deep text-text-primary',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_20px_rgba(196,57,15,0.25)]',
  'transition-all duration-250 hover:brightness-110 active:scale-[0.98]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
  'disabled:pointer-events-none disabled:opacity-40',
)

interface BeamButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  size?: BeamSize
}

export function BeamButton({
  children,
  className,
  size = 'md',
  disabled,
  ...props
}: BeamButtonProps) {
  return (
    <BeamWrapper>
      <button
        className={cn(beamButtonClasses, shapeClasses.pill, sizeClasses[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </BeamWrapper>
  )
}

interface BeamLinkProps extends Omit<LinkProps, 'className'> {
  children: ReactNode
  size?: BeamSize
  className?: string
  arrowBadge?: boolean
  shape?: BeamShape
}

export function BeamLink({
  children,
  className,
  size = 'md',
  arrowBadge = false,
  shape = 'pill',
  ...props
}: BeamLinkProps) {
  return (
    <BeamWrapper shape={shape}>
      <Link
        className={cn(
          beamButtonClasses,
          shapeClasses[shape],
          'group',
          arrowBadge ? badgeSizeClasses[size] : sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
        {arrowBadge ? <LaunchArrowBadge size={size} /> : null}
      </Link>
    </BeamWrapper>
  )
}
