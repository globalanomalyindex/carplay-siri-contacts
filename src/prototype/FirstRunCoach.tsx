import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useReducedMotion } from '../a11y/useReducedMotion'
import { easing } from '../tokens/motion'
import { space } from '../tokens/spatial'
import { hasPlayedCoach, markCoachPlayed } from './coachGate'

export interface FirstRunCoachProps {
  /** The CarPlay screen bounds; the coach measures the orb and a row within it. */
  screenRef: React.RefObject<HTMLDivElement | null>
}

interface CoachGeometry {
  orb: { x: number; y: number; size: number }
  target: { x: number; y: number; width: number; height: number; radius: number }
}

/**
 * A one-time, silent demonstration of the signature gesture. The drag-the-orb-
 * to-magnify-any-control move is the least discoverable thing in the prototype,
 * so on first load a translucent dot glides from the orb to the first contact
 * row, the lens locks and the row swells, then the whole thing dissolves. It
 * plays exactly once per visit, dismisses the instant the visitor touches the
 * screen or presses a key, and is purely presentational (it never receives
 * input). Written instruction lives in the surrounding page; this is spatial.
 *
 * Under reduced motion the finger does not travel. A short static hint marks
 * the orb and the row with a faint guide between them, holds briefly, and fades.
 */
export function FirstRunCoach({ screenRef }: FirstRunCoachProps) {
  const reduced = useReducedMotion()
  // Decide once, on mount, whether this instance is the one that plays. The
  // lazy initializer runs a single time, so a remount never re-reads the gate
  // and never re-triggers the demonstration.
  const [shouldPlay] = useState(() => !hasPlayedCoach())
  const [visible, setVisible] = useState(shouldPlay)
  const [geo, setGeo] = useState<CoachGeometry | null>(null)

  // Claim the one play for this visit as soon as we commit to showing it, so a
  // second stage mounting in the same document never also plays.
  useEffect(() => {
    if (shouldPlay) markCoachPlayed()
  }, [shouldPlay])

  // Measure the orb's centre and the first contact row relative to the screen,
  // so the demonstration sits on the real chrome regardless of exact metrics.
  useEffect(() => {
    if (!shouldPlay) return
    const screen = screenRef.current
    if (!screen) return
    const orb = screen.querySelector('[data-testid="master-orb-hit"]')
    const row = screen.querySelector('[data-testid^="magnifiable-contact-row-"]')
    if (!orb || !row) return
    const sr = screen.getBoundingClientRect()
    const or = orb.getBoundingClientRect()
    const rr = (row as HTMLElement).getBoundingClientRect()
    const cs = getComputedStyle(row as HTMLElement)
    setGeo({
      orb: {
        x: or.left - sr.left + or.width / 2,
        y: or.top - sr.top + or.height / 2,
        size: Math.max(or.width, or.height),
      },
      target: {
        x: rr.left - sr.left,
        y: rr.top - sr.top,
        width: rr.width,
        height: rr.height,
        radius: parseFloat(cs.borderRadius) || 8,
      },
    })
  }, [screenRef, shouldPlay])

  // Dismiss on the first real interaction (pointer or key), and on a timed
  // fallback so it never lingers if the visitor just reads. A pointer/key that
  // arrives mid-demonstration ends it immediately and it never replays.
  useEffect(() => {
    if (!visible) return
    const screen = screenRef.current
    const dismiss = () => setVisible(false)
    screen?.addEventListener('pointerdown', dismiss)
    window.addEventListener('keydown', dismiss)
    const total = reduced ? 2600 : 4200
    const t = window.setTimeout(dismiss, total)
    return () => {
      screen?.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('keydown', dismiss)
      window.clearTimeout(t)
    }
  }, [visible, screenRef, reduced])

  if (!geo) return null

  const { orb, target } = geo
  const targetCx = target.x + target.width / 2
  const targetCy = target.y + target.height / 2

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          data-testid="first-run-coach"
          data-mode={reduced ? 'static' : 'animated'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.24 } }}
          transition={{ duration: 0.4, ease: easing.frameEmerge, delay: 0.3 }}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }}
        >
          {reduced ? (
            <StaticHint orb={orb} target={target} targetCx={targetCx} targetCy={targetCy} />
          ) : (
            <AnimatedDemo
              orb={orb}
              target={target}
              targetCx={targetCx}
              targetCy={targetCy}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface PartProps {
  orb: CoachGeometry['orb']
  target: CoachGeometry['target']
  targetCx: number
  targetCy: number
}

/**
 * The moving demonstration. A translucent dot leaves the orb, travels to the
 * row, and on arrival the lens halo swells over the row to read as a lock. The
 * pieces are timed off shared motion tokens so the feel matches the real lens.
 */
function AnimatedDemo({ orb, target, targetCx, targetCy }: PartProps) {
  // Dot leaves the orb, arrives over the row, then the lock halo blooms.
  const travel = 1.1
  const arriveAt = 0.45 + travel

  return (
    <>
      {/* Faint guide line from the orb toward the row, drawn as the dot moves. */}
      <motion.span
        style={{
          position: 'absolute',
          left: orb.x,
          top: orb.y,
          width: Math.hypot(targetCx - orb.x, targetCy - orb.y),
          height: 1.5,
          transformOrigin: '0 50%',
          rotate: `${(Math.atan2(targetCy - orb.y, targetCx - orb.x) * 180) / Math.PI}deg`,
          background:
            'linear-gradient(90deg, rgba(125,225,255,0) 0%, rgba(125,225,255,0.4) 100%)',
          borderRadius: 1,
        }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: [0, 0.7, 0.7, 0], scaleX: [0, 1, 1, 1] }}
        transition={{
          duration: arriveAt + 0.7,
          times: [0, travel / (arriveAt + 0.7), 0.9, 1],
          ease: easing.frameEmerge,
          delay: 0.45,
        }}
      />

      {/* The lock halo: blooms over the row when the dot lands, the way the real
          liquid lens settles on a content lock. */}
      <motion.span
        style={{
          position: 'absolute',
          left: target.x - space.lensPadX,
          top: target.y - space.lensPadY,
          width: target.width + space.lensPadX * 2,
          height: target.height + space.lensPadY * 2,
          borderRadius: target.radius + 3,
          boxShadow:
            '0 0 0 1px rgba(196,232,255,0.7), 0 10px 30px rgba(130,200,255,0.40)',
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0) 56%)',
        }}
        initial={{ opacity: 0, scale: 1 }}
        // The settle mirrors the content lock settle (1.04x) the real frame
        // makes, eased on the same magnify-lock curve so the demonstration and
        // the live gesture read the same.
        animate={{ opacity: [0, 0, 1, 1, 0], scale: [1, 1, space.contentSettleScale, 1.0, 1.0] }}
        transition={{
          duration: arriveAt + 0.8,
          times: [0, travel / (arriveAt + 0.8), (travel + 0.18) / (arriveAt + 0.8), 0.85, 1],
          ease: easing.magnifyLock,
        }}
      />

      {/* The travelling fingertip dot. Starts on the orb, glides to the row. */}
      <motion.span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 18,
          height: 18,
          marginLeft: -9,
          marginTop: -9,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 38% 34%, rgba(255,255,255,0.92), rgba(170,225,255,0.55) 60%, rgba(120,200,255,0) 72%)',
          boxShadow: '0 0 12px rgba(150,220,255,0.7)',
        }}
        initial={{ x: orb.x, y: orb.y, opacity: 0, scale: 0.7 }}
        animate={{
          x: [orb.x, orb.x, targetCx, targetCx],
          y: [orb.y, orb.y, targetCy, targetCy],
          opacity: [0, 1, 1, 0],
          scale: [0.7, 1, 1, 0.85],
        }}
        transition={{
          duration: arriveAt + 0.5,
          times: [0, 0.45 / (arriveAt + 0.5), (0.45 + travel) / (arriveAt + 0.5), 1],
          ease: easing.magnifyLock,
        }}
      />
    </>
  )
}

/**
 * The reduced-motion alternative. No travel: the orb and the row are both
 * marked, with a faint static guide between them, so the spatial relationship
 * still reads. It holds steady and then fades with the wrapper.
 */
function StaticHint({ orb, target, targetCx, targetCy }: PartProps) {
  return (
    <>
      <span
        style={{
          position: 'absolute',
          left: orb.x,
          top: orb.y,
          width: orb.size + 8,
          height: orb.size + 8,
          marginLeft: -(orb.size + 8) / 2,
          marginTop: -(orb.size + 8) / 2,
          borderRadius: '50%',
          border: '2px solid rgba(125, 225, 255, 0.8)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: orb.x,
          top: orb.y,
          width: Math.hypot(targetCx - orb.x, targetCy - orb.y),
          height: 1.5,
          transformOrigin: '0 50%',
          rotate: `${(Math.atan2(targetCy - orb.y, targetCx - orb.x) * 180) / Math.PI}deg`,
          background:
            'linear-gradient(90deg, rgba(125,225,255,0.15) 0%, rgba(125,225,255,0.45) 100%)',
          borderRadius: 1,
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: target.x - space.lensPadX,
          top: target.y - space.lensPadY,
          width: target.width + space.lensPadX * 2,
          height: target.height + space.lensPadY * 2,
          borderRadius: target.radius + 3,
          boxShadow:
            '0 0 0 1px rgba(196,232,255,0.7), 0 8px 22px rgba(130,200,255,0.30)',
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 56%)',
        }}
      />
    </>
  )
}
