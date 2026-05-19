import type { ReactNode } from 'react'

export interface SectionLabelProps {
  /** Numbered eyebrow string, e.g. "02 / Friction". */
  children: ReactNode
}

/**
 * Apple-style numbered eyebrow above each section heading.
 * Uppercase, tracked, with a small leading rule.
 */
export function SectionLabel({ children }: SectionLabelProps) {
  return <p className="cs-eyebrow">{children}</p>
}
