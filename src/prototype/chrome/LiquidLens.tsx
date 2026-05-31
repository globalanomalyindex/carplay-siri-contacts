import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useMagnifierContext } from '../Magnifier'
import { useReducedMotion } from '../../a11y/useReducedMotion'
import { space } from '../../tokens/spatial'
import { springs } from '../../tokens/motion'

export interface LiquidLensProps {
  /** The CarPlay screen bounds; the lens measures targets relative to it. */
  screenRef: React.RefObject<HTMLDivElement | null>
}

interface LensRect {
  left: number
  top: number
  width: number
  height: number
  radius: number
}

/** Horizontal / vertical halo the glass adds around the locked target. */
const PAD_X = space.lensPadX
const PAD_Y = space.lensPadY

function rectsClose(a: LensRect, b: LensRect): boolean {
  return (
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5 &&
    Math.abs(a.radius - b.radius) < 0.5
  )
}

/**
 * The single liquid-glass lens. Rather than each cell painting its own glass,
 * one lens lives in an overlay layer ABOVE the chrome (so it is never clipped
 * by the screen's rounded overflow, which is what cut the magnified left-rail
 * items off) and flows between locked targets with a spring. As the lock moves
 * from a dock icon to a tab to a row, the lens stretches and slides between
 * them like a bead of mercury, the way Apple's Liquid Glass dock merges.
 *
 * It tracks the live rect of the locked target on every frame, so it stays
 * glued to the (magnifying) cell underneath while still lagging just enough to
 * read as liquid.
 */
export function LiquidLens({ screenRef }: LiquidLensProps) {
  const { lockedId, rotaryActive } = useMagnifierContext()
  const reduced = useReducedMotion()
  const [rect, setRect] = useState<LensRect | null>(null)
  const rectRef = useRef<LensRect | null>(null)

  useEffect(() => {
    const screen = screenRef.current
    if (!rotaryActive || !lockedId || !screen) {
      rectRef.current = null
      setRect(null)
      return
    }

    let raf = 0
    const measure = () => {
      const target = screen.querySelector(`[data-testid="magnifiable-${lockedId}"]`)
      if (target) {
        const sr = screen.getBoundingClientRect()
        const tr = (target as HTMLElement).getBoundingClientRect()
        const cs = getComputedStyle(target as HTMLElement)
        const radius = parseFloat(cs.borderRadius) || 10
        // Clamp to the screen (with a few px of glow bleed) so the lens hugs a
        // full-width row instead of sticking out past the device edges.
        const bleed = 6
        const l = Math.max(tr.left - sr.left - PAD_X, -bleed)
        const r = Math.min(tr.right - sr.left + PAD_X, sr.width + bleed)
        const t = Math.max(tr.top - sr.top - PAD_Y, -bleed)
        const b = Math.min(tr.bottom - sr.top + PAD_Y, sr.height + bleed)
        const next: LensRect = {
          left: l,
          top: t,
          width: Math.max(0, r - l),
          height: Math.max(0, b - t),
          radius: radius + 3,
        }
        if (!rectRef.current || !rectsClose(rectRef.current, next)) {
          rectRef.current = next
          setRect(next)
        }
      }
      raf = requestAnimationFrame(measure)
    }
    raf = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(raf)
  }, [lockedId, rotaryActive, screenRef])

  return (
    <AnimatePresence>
      {rect && (
        <motion.div
          data-testid="liquid-lens"
          data-variant="liquid-lens"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            borderRadius: rect.radius,
          }}
          exit={{ opacity: 0, transition: { duration: 0.16 } }}
          transition={
            reduced
              ? { duration: 0.12 }
              : {
                  opacity: { duration: 0.14 },
                  // Quick spring with a hint of overshoot so the lens flows
                  // and stretches between targets like liquid.
                  type: 'spring',
                  ...springs.lensFlow,
                }
          }
          style={{
            position: 'absolute',
            zIndex: 12,
            pointerEvents: 'none',
            // Convex glass dome: bright top sheen fading to a clear centre so
            // the magnified content underneath stays crisp.
            backgroundImage:
              'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0) 56%)',
            boxShadow: [
              'inset 0 1.5px 1px rgba(255,255,255,0.6)', //  convex top light
              'inset 0 -5px 10px rgba(28,48,78,0.22)', //     convex underside
              '0 0 0 1px rgba(196,232,255,0.7)', //           crisp glass rim
              '0 12px 36px rgba(130,200,255,0.40)', //        iridescent glow
              '0 4px 12px rgba(0,0,0,0.30)', //               lift
            ].join(', '),
          }}
        >
          {/* Chromatic-aberration rim: a thin spectral ring via a masked conic
              gradient, blended as light so it reads as a glass edge. */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              padding: 1.5,
              background:
                'conic-gradient(from 140deg, rgba(255,94,138,0.65), rgba(255,211,107,0.5), rgba(107,255,209,0.5), rgba(107,154,255,0.65), rgba(181,115,255,0.65), rgba(255,94,138,0.65))',
              WebkitMask:
                'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              mixBlendMode: 'screen',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
