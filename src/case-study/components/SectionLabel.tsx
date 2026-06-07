import type { ReactNode } from 'react'

export interface SectionLabelProps {
  /** Numbered eyebrow string, e.g. "02 · thesis". */
  children: ReactNode
}

/**
 * Numbered eyebrow above each section heading. Mono, uppercase-tracked, with the
 * leading index weighted so it reads as the section number. Ink only; the one
 * bit of color near it is the ASCII arrow rendered just above.
 */
export function SectionLabel({ children }: SectionLabelProps) {
  const text = typeof children === 'string' ? children : ''
  const sep = text.indexOf('·')
  if (sep > 0) {
    const num = text.slice(0, sep).trim()
    const rest = text.slice(sep)
    return (
      <p className="cs-eyebrow">
        <span className="cs-eyebrow-num">{num}</span> {rest}
      </p>
    )
  }
  return <p className="cs-eyebrow">{children}</p>
}
