import type { ReactNode } from 'react'

interface ComparisonItem {
  title: string
  icon: ReactNode
  pros: string[]
  cons: string[]
}

interface DocsComparisonPanelProps {
  items: ComparisonItem[]
}

export function DocsComparisonPanel({ items }: DocsComparisonPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-border-subtle glass-surface-light p-5"
        >
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated/60 text-orange-warm">
            {item.icon}
          </div>
          <h3 className="font-heading text-sm font-semibold text-text-primary">{item.title}</h3>
          <ul className="mt-4 space-y-2">
            {item.pros.map((p) => (
              <li key={p} className="flex gap-2 text-xs text-text-secondary">
                <span className="text-emerald-400">+</span>
                {p}
              </li>
            ))}
            {item.cons.map((c) => (
              <li key={c} className="flex gap-2 text-xs text-text-muted">
                <span className="text-red-400/80">−</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
