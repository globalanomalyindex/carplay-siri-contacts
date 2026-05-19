import type { ReactNode } from 'react'

export interface SpecRow {
  label: ReactNode
  value: ReactNode
}

export interface SpecTableProps {
  rows: SpecRow[]
  /** Optional caption above the table. */
  caption?: ReactNode
}

/**
 * Two-column tech-spec table. Label on the left (uppercase tracked),
 * value on the right (right-aligned monospace by default). Wrap with
 * <code className="spec-value"> for inline monospace within mixed labels).
 */
export function SpecTable({ rows, caption }: SpecTableProps) {
  return (
    <div>
      {caption && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--cs-text-2)',
            marginBottom: 14,
          }}
        >
          {caption}
        </div>
      )}
      <div>
        {rows.map((row, i) => (
          <div className="spec-row" key={i}>
            <div className="spec-label">{row.label}</div>
            <div className="spec-val">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
