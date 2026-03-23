import { useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const HEX = '0123456789abcdef'

function randomHexHash(): string {
  let out = '0x'
  for (let i = 0; i < 64; i++) {
    out += HEX[Math.floor(Math.random() * 16)]
  }
  return out
}

interface CommitmentHashBoxProps {
  hash: string | null
  isComputing?: boolean
  className?: string
}

/**
 * Displays the live Poseidon commitment hash with a scramble-to-resolve animation.
 * While computing: characters scramble rapidly.
 * On resolve: locks in the final hash left-to-right.
 */
export function CommitmentHashBox({
  hash,
  isComputing = false,
  className,
}: CommitmentHashBoxProps) {
  const [display, setDisplay] = useState<string | null>(hash)
  const scrambleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resolveRef = useRef<number | null>(null)

  const clearTimers = () => {
    if (scrambleRef.current) {
      clearInterval(scrambleRef.current)
      scrambleRef.current = null
    }
    if (resolveRef.current !== null) {
      cancelAnimationFrame(resolveRef.current)
      resolveRef.current = null
    }
  }

  useEffect(() => {
    clearTimers()

    if (isComputing) {
      setDisplay(randomHexHash())
      scrambleRef.current = setInterval(() => {
        setDisplay(randomHexHash())
      }, 55)
      return clearTimers
    }

    if (!hash) {
      setDisplay(null)
      return
    }

    const target = hash.toLowerCase()
    let frame = 0
    const totalFrames = 28

    const resolve = () => {
      const progress = frame / totalFrames
      const locked = Math.floor(progress * 64)

      let next = '0x'
      for (let i = 0; i < 64; i++) {
        next += i < locked ? target[2 + i] : HEX[Math.floor(Math.random() * 16)]
      }

      setDisplay(next)
      frame++

      if (frame <= totalFrames) {
        resolveRef.current = requestAnimationFrame(resolve)
      } else {
        setDisplay(target)
      }
    }

    resolveRef.current = requestAnimationFrame(resolve)
    return clearTimers
  }, [hash, isComputing])

  const placeholder = '0x································································'

  return (
    <div className={cn('space-y-1.5', className)}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
        ZK Commitment Hash
      </p>
      <div className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-bg-elevated/60 px-3 py-2.5">
        <Lock
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-orange-warm/70 transition-opacity',
            isComputing && 'animate-pulse opacity-100',
          )}
        />
        <span
          className={cn(
            'truncate font-mono text-xs transition-colors duration-200',
            display ? 'text-orange-warm' : 'text-text-faint',
            isComputing && 'opacity-90',
          )}
        >
          {display ?? placeholder}
        </span>
      </div>
    </div>
  )
}
