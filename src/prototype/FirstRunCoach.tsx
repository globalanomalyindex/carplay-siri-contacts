import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useReducedMotion } from '../a11y/useReducedMotion'

export interface FirstRunCoachProps {
  /** The CarPlay screen bounds; the coach measures the orb within it. */
  screenRef: React.RefObject<HTMLDivElement | null>
}

/**
 * A one-time attention cue. Nobody arriving cold knows the orb is the way in,
 * so on first load a soft cyan ring pulses out from the orb's home to say
 * "start here". It dismisses the instant the user touches the screen, and
 * after a few seconds on its own, so it never gets in the way. The written
 * instruction lives in the surrounding page legend; this is purely spatial.
 *
 * Under reduced motion the ring holds steady instead of pulsing.
 */
export function FirstRunCoach({ screenRef }: FirstRunCoachProps) {
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const [pos, setPos] = useState<{ x: number; y: number; size: number } | null>(null)

  // Measure the orb's centre relative to the screen so the ring sits on it
  // regardless of exact chrome metrics.
  useEffect(() => {
    const screen = screenRef.current
    if (!screen) return
    const orb = screen.querySelector('[data-testid="master-orb-hit"]')
    if (!orb) return
    const sr = screen.getBoundingClientRect()
    const or = orb.getBoundingClientRect()
    setPos({
      x: or.left - sr.left + or.width / 2,
      y: or.top - sr.top + or.height / 2,
      size: Math.max(or.width, or.height),
    })
  }, [screenRef])

  // Dismiss on the first real interaction, with a timed fallback so it never
  // lingers if the visitor just reads.
  useEffect(() => {
    if (!visible) return
    const screen = screenRef.current
    const dismiss = () => setVisible(false)
    screen?.addEventListener('pointerdown', dismiss)
    const t = window.setTimeout(dismiss, 7000)
    return () => {
      screen?.removeEventListener('pointerdown', dismiss)
      window.clearTimeout(t)
    }
  }, [visible, screenRef])

  if (!pos) return null

  const ringBase = {
    position: 'absolute' as const,
    left: pos.x,
    top: pos.y,
    width: pos.size,
    height: pos.size,
    marginLeft: -pos.size / 2,
    marginTop: -pos.size / 2,
    borderRadius: '50%',
    border: '2px solid rgba(125, 225, 255, 0.9)',
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          data-testid="first-run-coach"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.22 } }}
          transition={{ duration: 0.5, ease: [0.08, 0.82, 0.17, 1], delay: 0.5 }}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }}
        >
          {reduced ? (
            <span style={{ ...ringBase, opacity: 0.7 }} />
          ) : (
            <>
              <motion.span
                style={ringBase}
                animate={{ scale: [1, 2.1], opacity: [0.65, 0] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                style={ringBase}
                animate={{ scale: [1, 2.1], opacity: [0.65, 0] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut', delay: 0.95 }}
              />
              <motion.span
                style={{ ...ringBase, borderColor: 'rgba(125, 225, 255, 0.55)' }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
