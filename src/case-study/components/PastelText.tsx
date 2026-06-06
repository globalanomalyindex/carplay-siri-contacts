import type { ReactNode } from 'react'

export type PastelVariant =
  | 'pink'
  | 'peach'
  | 'yellow'
  | 'mint'
  | 'sky'
  | 'lavender'
  | 'gradient-1'
  | 'gradient-2'

export interface PastelTextProps {
  variant?: PastelVariant
  highlight?: boolean
  children: ReactNode
}

/**
 * Inline emphasis on a key word. The smooth rainbow is gone; in the brutalist
 * layer the only color is the ASCII arrow, so emphasis here is a hard
 * monochrome underline. The variant and highlight props are kept for call-site
 * compatibility and intentionally ignored.
 */
export function PastelText({ children }: PastelTextProps) {
  return <span className="cs-emph">{children}</span>
}
