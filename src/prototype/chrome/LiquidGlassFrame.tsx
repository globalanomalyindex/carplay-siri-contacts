import type { ReactNode, CSSProperties } from 'react'

/** Render variant of the LiquidGlassFrame. Maps to Figma component name. */
export type LiquidGlassVariant = 'liquid-glass'
/** Interactive/contrast state. */
export type LiquidGlassState = 'default' | 'bright'

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
      data-variant="liquid-glass"
      data-state={bright ? 'bright' : 'default'}
      style={{
        width: dim ?? 'var(--glass-size)',
        height: dim ?? 'var(--glass-size)',
        borderRadius: 'var(--glass-radius)',
        background: 'var(--glass-fill)',
        border: `1px solid ${borderColor}`,
        boxShadow: [
          'inset 0 1.5px 1px rgba(255, 255, 255, 0.5)', //   convex top light
          'inset 0 -2px 4px rgba(0, 0, 0, 0.18)', //          convex underside
          '-1px -0.5px 0 0.5px rgba(255, 120, 180, 0.22)', // chromatic fringe, warm
          '1px 0.5px 0 0.5px rgba(120, 170, 255, 0.30)', //   chromatic fringe, cool
          '0 1px 3px rgba(0, 0, 0, 0.12)',
          '0 6px 24px var(--glass-glow)',
        ].join(', '),
        // iOS Vibrancy: heavier blur + saturate boost. Mirrors UIKit's
        // .systemUltraThinMaterial look when stacked over the carplay tray.
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
