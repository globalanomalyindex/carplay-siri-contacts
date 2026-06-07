import type { ReactNode } from 'react'

export interface EmphasisProps {
  children: ReactNode
}

/**
 * Inline emphasis on a key word or phrase. A hard monochrome underline: in the
 * brutalist layer the only color is the ASCII arrow, so emphasis is type, not
 * hue.
 */
export function Emphasis({ children }: EmphasisProps) {
  return <span className="cs-emph">{children}</span>
}
