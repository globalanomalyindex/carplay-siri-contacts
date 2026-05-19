import type { ReactNode, CSSProperties } from 'react'

export interface LiquidGlassFrameProps {
  children: ReactNode
  /** Size override; defaults to var(--glass-size) = 46pt. */
  size?: number
  /** Increases border opacity for high-glare / high-contrast conditions. */
  bright?: boolean
  /** Optional style passthrough for animation libraries (Motion). */
  style?: CSSProperties
}

/**
 * The liquid-glass frame. Translucent rounded square that sits at the orb's
 * home position. Persistent even when the orb itself is dissipated or in rotary
 * mode. Specs: section 4.3 and 6 (--glass-* tokens).
 *
 * Border color is written as a literal rgba string rather than a CSS var so
 * jsdom (which does not resolve custom properties) can read it back in tests.
 * Keep these values in sync with --glass-border and --glass-border-bright in
 * src/tokens/color.css.
 */
export function LiquidGlassFrame({
  children,
  size,
  bright = false,
  style,
}: LiquidGlassFrameProps) {
  const dim = size ?? undefined

  // Mirrors --glass-border / --glass-border-bright in src/tokens/color.css.
  const borderColor = bright
    ? 'rgba(255, 255, 255, 0.45)'
    : 'rgba(255, 255, 255, 0.22)'

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: dim ?? 'var(--glass-size)',
        height: dim ?? 'var(--glass-size)',
        borderRadius: 'var(--glass-radius)',
        background: 'var(--glass-fill)',
        border: `1px solid ${borderColor}`,
        boxShadow: [
          'inset 0 1px 0 var(--glass-highlight)',
          'inset 0 -1px 0 var(--glass-shadow)',
          '0 6px 24px var(--glass-glow)',
        ].join(', '),
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
