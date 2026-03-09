import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface GhostButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
}


export function GhostButton({
  children,
  className,
  size = 'md',
  disabled,
  ...props
}: GhostButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'text-text-secondary transition-colors duration-200',
        'hover:bg-white/[0.04] hover:text-text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-primary/30',
        'disabled:pointer-events-none disabled:opacity-40',
        sizeClasses[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
