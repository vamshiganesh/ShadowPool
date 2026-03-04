import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface BeamWrapperProps {
  children: ReactNode
  className?: string
}

export function BeamWrapper({ children, className }: BeamWrapperProps) {
  return (
    <div className={cn('group relative inline-flex rounded-pill p-px', className)}>
      <div
        className="absolute inset-0 rounded-pill opacity-50 transition-opacity duration-300 group-hover:opacity-80 animate-beam-rotate"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0%, rgba(196,57,15,0.9) 20%, rgba(183,102,83,0.7) 40%, transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-px rounded-pill bg-bg-base/40" aria-hidden="true" />
      <div className="relative rounded-pill">{children}</div>
    </div>
  )
}

interface BeamButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  asChild?: false
}

const sizeClasses = {
  sm: 'h-9 px-5 text-xs',
  md: 'h-11 px-7 text-sm',
  lg: 'h-12 px-9 text-base',
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
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-pill font-medium tracking-wide',
          'bg-gradient-to-b from-orange-primary to-orange-deep text-text-primary',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_20px_rgba(196,57,15,0.25)]',
          'transition-all duration-250 hover:brightness-110 active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
          'disabled:pointer-events-none disabled:opacity-40',
          sizeClasses[size],
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </BeamWrapper>
  )
}
