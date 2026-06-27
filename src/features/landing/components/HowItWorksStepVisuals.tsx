import { useEffect, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Cpu, Diamond, Lock } from 'lucide-react'
import { CodePanel } from '@/components/marketing/CodePanel'
import { InlineCodePill } from '@/components/ui/InlineCodePill'
import { COMMITMENT_CODE, HOW_IT_WORKS_STEPS } from '@/features/landing/data'
import { cn } from '@/lib/utils/cn'

type VisualType = (typeof HOW_IT_WORKS_STEPS)[number]['visual']

function useVisualHover() {
  const [hovered, setHovered] = useState(false)
  return {
    hovered,
    bind: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
    },
  }
}

export function StepVisual({ type }: { type: VisualType }) {
  switch (type) {
    case 'code':
      return (
        <VisualShell>
          {(hovered) => <CodeCompileVisual hovered={hovered} />}
        </VisualShell>
      )
    case 'hash':
      return (
        <VisualShell>
          {(hovered) => <HashGenerateVisual hovered={hovered} />}
        </VisualShell>
      )
    case 'matcher':
      return (
        <VisualShell>
          {(hovered) => <MatcherVisual hovered={hovered} />}
        </VisualShell>
      )
    case 'proof':
      return (
        <VisualShell>
          {(hovered) => <ProofVisual hovered={hovered} />}
        </VisualShell>
      )
    case 'settlement':
      return (
        <VisualShell>
          {(hovered) => <SettlementVisual hovered={hovered} />}
        </VisualShell>
      )
    default:
      return null
  }
}

function VisualShell({
  children,
  className,
}: {
  children: (hovered: boolean) => ReactNode
  className?: string
}) {
  const { hovered, bind } = useVisualHover()

  return (
    <div {...bind} className={cn('h-full min-h-[220px] w-full', className)}>
      {children(hovered)}
    </div>
  )
}

function CodeCompileVisual({ hovered }: { hovered: boolean }) {
  const reduceMotion = useReducedMotion()
  const lines = COMMITMENT_CODE.split('\n').length

  return (
    <div className="relative">
      <CodePanel code={COMMITMENT_CODE} language="rust" />
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[42px] bottom-0 overflow-hidden rounded-b-xl"
        initial={false}
      >
        {hovered && !reduceMotion && (
          <motion.div
            className="absolute inset-x-0 h-8 bg-gradient-to-b from-orange-primary/25 to-transparent"
            initial={{ top: 0 }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 1.4, ease: 'linear', repeat: Infinity }}
          />
        )}
        {hovered && !reduceMotion &&
          Array.from({ length: lines }).map((_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute inset-x-2 h-[1.35rem] rounded-sm bg-orange-primary/10"
              style={{ top: 16 + i * 21.6 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.65, 0] }}
              transition={{
                duration: 0.75,
                delay: i * 0.08,
                repeat: Infinity,
                repeatDelay: lines * 0.08 + 0.35,
              }}
            />
          ))}
      </motion.div>
      <motion.span
        className="absolute right-3 top-3 rounded-md border border-orange-primary/30 bg-orange-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-orange-warm"
        initial={{ opacity: 0, y: -4 }}
        animate={{
          opacity: hovered ? 1 : 0,
          y: hovered ? 0 : -4,
        }}
        transition={{ duration: 0.25 }}
      >
        Compiling…
      </motion.span>
    </div>
  )
}

const HASH_FINAL = '0x8f2a…c93b'
const SCRAMBLE_CHARS = '0123456789abcdef'

function scrambleHash(final: string) {
  return final
    .split('')
    .map((ch) => (ch === 'x' || ch === '…' ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * 16)]))
    .join('')
}

function HashGenerateVisual({ hovered }: { hovered: boolean }) {
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(HASH_FINAL)

  useEffect(() => {
    if (!hovered || reduceMotion) {
      setDisplay(HASH_FINAL)
      return
    }

    let tick = 0
    const id = window.setInterval(() => {
      tick += 1
      if (tick >= 14) {
        setDisplay(HASH_FINAL)
        window.clearInterval(id)
        return
      }
      setDisplay(scrambleHash(HASH_FINAL))
    }, 45)

    return () => window.clearInterval(id)
  }, [hovered, reduceMotion])

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-bg-base/60 py-10">
      <motion.div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-orange-primary/30 bg-orange-primary/10"
        animate={{
          scale: hovered ? [1, 1.06, 1] : 1,
          boxShadow: hovered
            ? '0 0 24px rgba(196, 57, 15, 0.35)'
            : '0 0 0 rgba(196, 57, 15, 0)',
        }}
        transition={{ duration: 0.5 }}
      >
        <Lock className="h-5 w-5 text-orange-warm" />
      </motion.div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
        Commitment Hash Submitted
      </p>
      <InlineCodePill className="mt-3 min-w-[9rem] justify-center text-sm tabular-nums">
        {display}
      </InlineCodePill>
    </div>
  )
}

function MatcherVisual({ hovered }: { hovered: boolean }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <OrderNode label="Order A" active={hovered} />
      <div className="flex flex-col items-center gap-1">
        <div className="h-px w-8 bg-border-default" />
        <motion.div
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-orange-primary/40 bg-orange-primary/15 shadow-glow"
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.35 }}
        >
          <Diamond className="h-5 w-5 text-orange-warm" />
        </motion.div>
        <div className="relative h-4 w-20 overflow-hidden">
          <motion.div
            className="flex flex-col items-center"
            animate={{
              y: hovered && !reduceMotion ? [0, -16, -16, 0] : 0,
            }}
            transition={{
              duration: 1.6,
              ease: [0.22, 1, 0.36, 1],
              repeat: hovered && !reduceMotion ? Infinity : 0,
              repeatDelay: 0.35,
              times: [0, 0.35, 0.65, 1],
            }}
          >
            <span className="flex h-4 items-center font-mono text-[10px] uppercase tracking-wider text-orange-warm">
              Matched
            </span>
            <span className="flex h-4 items-center font-mono text-[10px] uppercase tracking-wider text-orange-warm">
              Matched
            </span>
          </motion.div>
        </div>
        <div className="h-px w-8 bg-border-default" />
      </div>
      <OrderNode label="Order B" active={hovered} />
    </div>
  )
}

function ProofVisual({ hovered }: { hovered: boolean }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-bg-base/60 py-10">
      <motion.div
        animate={{ rotate: hovered && !reduceMotion ? 360 : 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        <Cpu className="h-8 w-8 text-orange-warm opacity-80" />
      </motion.div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-text-faint">
        Generating Groth16 Proof
      </p>
      <div className="relative mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-border-subtle">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-deep to-orange-primary"
          initial={false}
          animate={{ width: hovered ? '92%' : '60%' }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
        {hovered && !reduceMotion && (
          <motion.div
            className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: [-48, 192] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
      <motion.p
        className="mt-2 font-mono text-[11px] text-text-muted"
        animate={{ opacity: hovered ? 1 : 0.7 }}
      >
        {hovered ? '~6.2s' : '~8.4s avg'}
      </motion.p>
    </div>
  )
}

function SettlementVisual({ hovered }: { hovered: boolean }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-10">
      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-emerald-500/15">
        <motion.div
          className="flex flex-col items-center"
          animate={{
            y: hovered && !reduceMotion ? [0, -48, -48, 0] : 0,
          }}
          transition={{
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1],
            repeat: hovered && !reduceMotion ? Infinity : 0,
            repeatDelay: 0.4,
            times: [0, 0.35, 0.65, 1],
          }}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center">
            <Check className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center">
            <Check className="h-6 w-6 text-emerald-400" />
          </div>
        </motion.div>
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-emerald-400/80">
        Atomic Settlement Complete
      </p>
      <InlineCodePill className="mt-3">tx 0x4e7b…f21a</InlineCodePill>
    </div>
  )
}

function OrderNode({ label, active }: { label: string; active: boolean }) {
  return (
    <motion.div
      className="rounded-lg border border-border-subtle glass-surface-light px-4 py-3 text-center"
      animate={{
        borderColor: active ? 'rgba(196, 57, 15, 0.35)' : 'rgba(245, 240, 238, 0.08)',
        y: active ? -2 : 0,
      }}
      transition={{ duration: 0.35 }}
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">{label}</p>
      <p className="mt-1 font-mono text-xs text-text-secondary">committed</p>
    </motion.div>
  )
}
