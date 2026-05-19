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
  /** When true, renders as a soft pastel marker highlight (background only) instead of gradient text fill. */
  highlight?: boolean
  children: ReactNode
}

const HIGHLIGHT_BG: Record<PastelVariant, string> = {
  pink:        'var(--pastel-pink)',
  peach:       'var(--pastel-peach)',
  yellow:      'var(--pastel-yellow)',
  mint:        'var(--pastel-mint)',
  sky:         'var(--pastel-sky)',
  lavender:    'var(--pastel-lavender)',
  'gradient-1': 'linear-gradient(110deg, var(--pastel-pink), var(--pastel-mint), var(--pastel-sky))',
  'gradient-2': 'linear-gradient(110deg, var(--pastel-sky), var(--pastel-peach))',
}

/**
 * Inline span that paints a pastel accent on key words. Defaults to a
 * gradient text fill. Pass `highlight` for the marker-style background.
 *
 * Used sparingly. Only on words that carry rhetorical weight in their
 * sentence.
 */
export function PastelText({
  variant = 'mint',
  highlight = false,
  children,
}: PastelTextProps) {
  if (highlight) {
    return (
      <span
        className="pastel-highlight"
        data-variant={variant}
        style={{ ['--bg' as 'background']: HIGHLIGHT_BG[variant] }}
      >
        {children}
      </span>
    )
  }
  return (
    <span className="pastel-text" data-variant={variant}>
      {children}
    </span>
  )
}
