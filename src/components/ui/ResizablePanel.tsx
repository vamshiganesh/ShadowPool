import type { ReactNode } from 'react'
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Maximize2,
  Minimize2,
  MoveHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type PanelHeight = 'compact' | 'default' | 'tall'
export type PanelWidth = 'default' | 'wide'

interface ResizablePanelProps {
  children: ReactNode
  height: PanelHeight
  width: PanelWidth
  maximized: boolean
  onHeightChange: (height: PanelHeight) => void
  onWidthChange: (width: PanelWidth) => void
  onMaximizedChange: (maximized: boolean) => void
  compactClassName?: string
  defaultClassName?: string
  tallClassName?: string
  className?: string
}

const HEIGHT_CYCLE: PanelHeight[] = ['compact', 'default', 'tall']

export function ResizablePanel({
  children,
  height,
  width,
  maximized,
  onHeightChange,
  onWidthChange,
  onMaximizedChange,
  compactClassName = 'h-40',
  defaultClassName = 'h-56 md:h-64',
  tallClassName = 'h-80 md:h-96',
  className,
}: ResizablePanelProps) {
  const cycleHeight = (direction: 'up' | 'down') => {
    const idx = HEIGHT_CYCLE.indexOf(height)
    const next =
        direction === 'up'
          ? HEIGHT_CYCLE[Math.min(idx + 1, HEIGHT_CYCLE.length - 1)]
          : HEIGHT_CYCLE[Math.max(idx - 1, 0)]
    onHeightChange(next)
  }

  const content = (
    <div
      className={cn(
        'flex min-h-0 flex-col overflow-hidden',
        !maximized && height === 'compact' && compactClassName,
        !maximized && height === 'default' && defaultClassName,
        !maximized && height === 'tall' && tallClassName,
        maximized && 'h-[min(70vh,640px)]',
        className,
      )}
    >
      {children}
    </div>
  )

  if (maximized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/90 p-4 backdrop-blur-sm">
        <div className="flex h-full max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-2xl">
          <div className="flex items-center justify-end gap-1 border-b border-border-subtle px-3 py-2">
            <PanelControls
              height={height}
              width={width}
              maximized={maximized}
              onHeightUp={() => cycleHeight('up')}
              onHeightDown={() => cycleHeight('down')}
              onToggleWidth={() => onWidthChange(width === 'wide' ? 'default' : 'wide')}
              onToggleMaximized={() => onMaximizedChange(false)}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-auto">{content}</div>
        </div>
      </div>
    )
  }

  return content
}

interface PanelControlsProps {
  height: PanelHeight
  width: PanelWidth
  maximized: boolean
  onHeightUp: () => void
  onHeightDown: () => void
  onToggleWidth: () => void
  onToggleMaximized: () => void
}

export function PanelControls({
  height,
  width,
  maximized,
  onHeightUp,
  onHeightDown,
  onToggleWidth,
  onToggleMaximized,
}: PanelControlsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <ControlButton
        label="Decrease height"
        onClick={onHeightDown}
        disabled={height === 'compact' && !maximized}
      >
        <ArrowDownToLine className="h-3.5 w-3.5" />
      </ControlButton>
      <ControlButton
        label="Increase height"
        onClick={onHeightUp}
        disabled={height === 'tall' && !maximized}
      >
        <ArrowUpToLine className="h-3.5 w-3.5" />
      </ControlButton>
      <ControlButton
        label={width === 'wide' ? 'Default width' : 'Expand width'}
        onClick={onToggleWidth}
        active={width === 'wide'}
      >
        <MoveHorizontal className="h-3.5 w-3.5" />
      </ControlButton>
      <ControlButton
        label={maximized ? 'Exit fullscreen' : 'Fullscreen'}
        onClick={onToggleMaximized}
        active={maximized}
      >
        {maximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </ControlButton>
    </div>
  )
}

function ControlButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-text-faint transition-colors',
        'hover:border-border-subtle hover:text-text-muted',
        active && 'border-orange-primary/30 bg-orange-primary/10 text-orange-warm',
        disabled && 'cursor-not-allowed opacity-30 hover:border-transparent hover:text-text-faint',
      )}
    >
      {children}
    </button>
  )
}
