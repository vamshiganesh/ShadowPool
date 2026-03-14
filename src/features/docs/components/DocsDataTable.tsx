import type { ReactNode } from 'react'

interface DocsDataTableProps {
  columns: string[]
  rows: (string | ReactNode)[][]
}

export function DocsDataTable({ columns, rows }: DocsDataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="border-b border-border-subtle bg-bg-elevated/40">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left font-mono text-[10px] font-normal uppercase tracking-wider text-text-faint"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border-subtle/50 last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-sm text-text-secondary first:font-mono first:text-text-primary"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
