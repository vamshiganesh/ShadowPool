import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  variant?: 'subtle' | 'default' | 'strong'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const variantClasses = {
  subtle: 'border-border-subtle',
  default: 'border-border-default',
  strong: 'border-border-strong',
}


const spacingClasses = {
  none: 'my-0',
  sm: 'my-3',
  md: 'my-5',
  lg: 'my-8',
}

export function Divider({
  className,
  variant = 'subtle',
  spacing = 'md',
  ...props
}: DividerProps) {
  return (
    <hr
      className={cn('border-0 border-t', variantClasses[variant], spacingClasses[spacing], className)}
      {...props}
    />
  )
}
