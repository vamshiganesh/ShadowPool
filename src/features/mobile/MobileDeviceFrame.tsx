import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatusPill } from '@/components/ui/StatusPill'
import { MonoLabel } from '@/components/ui/MonoLabel'

interface MobileDeviceFrameProps {
  children: ReactNode
  className?: string
}

export function MobileDeviceFrame({ children, className }: MobileDeviceFrameProps) {
  return (
    <div className={cn('relative mx-auto', className)}>
      <FloatingCard
        className="absolute -left-8 top-8 hidden lg:block"
        label="ZK Engine"
        value="ACTIVE"
        sub="24ms latency"
        status="live"
      />
      <FloatingCard
        className="absolute -left-12 bottom-24 hidden lg:block"
        label="Last Settlement"
        value="2.50 ETH"
        sub="0xA1…9fB · Block 7,234,891"
        status="ok"
      />
      <FloatingCard
        className="absolute -right-10 top-1/3 hidden lg:block"
        label="Proof Gen"
        value="8.4s avg"
        sub="Groth16"
        status="pending"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto w-full max-w-[320px] rounded-[2.5rem] border border-border-default bg-bg-surface p-2 shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
      >
        {/* Dynamic island */}
        <div className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-bg-base" />
        <div className="overflow-hidden rounded-[2rem] border border-border-subtle bg-bg-base">
          <div className="h-[640px] overflow-hidden">{children}</div>
        </div>
        {/* Home indicator */}
        <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-border-strong" />
      </motion.div>
    </div>
  )
}

function FloatingCard({
  label,
  value,
  sub,
  status,
  className,
}: {
  label: string
  value: string
  sub: string
  status: 'live' | 'ok' | 'pending'
  className?: string
}) {
  return (
    <GlassCard padding="sm" className={cn('w-44', className)}>
      <MonoLabel variant="faint" size="micro">
        {label}
      </MonoLabel>
      <p className="mt-1 font-heading text-sm font-semibold text-text-primary">{value}</p>
      <p className="mt-0.5 font-mono text-[10px] text-text-faint">{sub}</p>
      {status === 'live' && <StatusPill label="Active" variant="pending" className="mt-2" />}
      {status === 'ok' && <StatusPill label="OK" variant="success" className="mt-2" />}
      {status === 'pending' && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-border-subtle">
          <div className="h-full w-2/3 bg-orange-primary/60" />
        </div>
      )}
    </GlassCard>
  )
}
