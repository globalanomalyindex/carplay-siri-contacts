import type { ReactNode } from 'react'

/** A spectrum stop, used to index the document by section. */
export type SectionStop = 'pink' | 'amber' | 'mint' | 'blue' | 'violet'

export interface SectionLabelProps {
  /** Numbered eyebrow string, e.g. "02 · Thesis". */
  children: ReactNode
  /**
   * The section's spectrum hue. Colors the leading number and rule only, never
   * the title, so the spectrum indexes the page without becoming wallpaper. It
   * is passed explicitly per call site (canonical, not derived from DOM order),
   * so reordering sections can never silently desync the index.
   */
  stop?: SectionStop
}

/**
 * Numbered eyebrow above each section heading. Uppercase, tracked, with a small
 * leading rule. When a spectrum stop is given, the leading number takes that hue.
 */
export function SectionLabel({ children, stop }: SectionLabelProps) {
  const text = typeof children === 'string' ? children : ''
  const sep = text.indexOf('·')
  if (stop && sep > 0) {
    const num = text.slice(0, sep).trim()
    const rest = text.slice(sep)
    return (
      <p className="cs-eyebrow" data-stop={stop}>
        <span className="cs-eyebrow-num">{num}</span> {rest}
      </p>
    )
  }
  return <p className="cs-eyebrow">{children}</p>
}
