import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { BeamWrapper } from './BeamWrapper'

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  beam?: boolean
}

const variantClasses = {
  primary:
    'bg-gradient-to-b from-orange-primary to-orange-deep text-text-primary shadow-glow hover:brightness-110',
  secondary: 'glass-surface text-text-primary hover:bg-bg-surface/80',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
  outline:
    'bg-transparent border border-border-default text-text-secondary hover:border-border-orange hover:text-text-primary',
}

const sizeClasses = {
  sm: 'h-8 px-4 text-xs',
  md: 'h-10 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
}

export function PillButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  beam = false,
  disabled,
  ...props
}: PillButtonProps) {
  const button = (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-all duration-250',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-primary/50',
        'disabled:pointer-events-none disabled:opacity-40',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )

  if (beam && variant === 'primary') {
    return <BeamWrapper>{button}</BeamWrapper>
  }

  return button
}
