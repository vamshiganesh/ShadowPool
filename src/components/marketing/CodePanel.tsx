import { cn } from '@/lib/utils/cn'

interface CodePanelProps {
  code: string
  language?: string
  className?: string
}

export function CodePanel({ code, language = 'rust', className }: CodePanelProps) {
  const lines = code.split('\n')

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated/90',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-orange-primary/60" />
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
          {language}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="mr-4 w-5 shrink-0 select-none text-right text-text-faint">
              {i + 1}
            </span>
            <code className="text-text-secondary">
              {highlightLine(line)}
            </code>
          </div>
        ))}
      </pre>
    </div>
  )
}


function highlightLine(line: string) {
  const keywords = ['fn', 'let', 'return', '&']
  const parts = line.split(/(\bfn\b|\blet\b|\breturn\b|&|\(|\)|\{|\}|,)/g)

  return parts.map((part, i) => {
    if (keywords.includes(part)) {
      return (
        <span key={i} className="text-orange-warm">
          {part}
        </span>
      )
    }
    if (part.match(/^[a-z_][a-z0-9_]*$/i) && !part.match(/^\d/)) {
      const fns = ['poseidon_hash', 'generate_commitment']
      if (fns.includes(part)) {
        return (
          <span key={i} className="text-text-primary">
            {part}
          </span>
        )
      }
    }
    return <span key={i}>{part}</span>
  })
}
