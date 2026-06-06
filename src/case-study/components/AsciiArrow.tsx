import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../a11y/useReducedMotion'

/**
 * The case study's signature motif: an ASCII arrow whose characters are gray
 * until a rainbow fill sweeps across them one at a time, then bounces back. The
 * five stops are the same Siri spectrum the prototype orb uses, so the one bit
 * of color in the brutalist layer still points at the product. Decorative, so
 * it is aria-hidden and honors reduced motion (renders the full fill, static).
 */
const STOPS = ['#FF6E7F', '#FFD86B', '#6BFFD1', '#6B9AFF', '#B573FF'] as const

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Color along the five-stop spectrum at t in [0, 1]. */
function spectrumAt(t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  const seg = clamped * (STOPS.length - 1)
  const i = Math.min(STOPS.length - 2, Math.floor(seg))
  const f = seg - i
  const a = hexToRgb(STOPS[i])
  const b = hexToRgb(STOPS[i + 1])
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

export interface AsciiArrowProps {
  /** Number of dash characters between the angle caps. */
  length?: number
  /** Animate the bouncing fill. False renders the full rainbow, static. */
  play?: boolean
  /** Seconds for one full bounce (fill out and empty back). */
  period?: number
  className?: string
}

export function AsciiArrow({
  length = 7,
  play = true,
  period = 2.2,
  className,
}: AsciiArrowProps) {
  const reduced = useReducedMotion()
  const chars = `<${'-'.repeat(Math.max(1, length))}>`
  const n = chars.length
  // animLit is driven by the rAF loop only. The static cases (reduced motion or
  // play=false) are derived during render below, so the effect body never calls
  // setState synchronously; only the async frame callback does.
  const [animLit, setAnimLit] = useState(0)
  const rafRef = useRef(0)
  const litRef = useRef(0)

  useEffect(() => {
    if (reduced || !play) return
    const periodMs = period * 1000
    let startTs = 0
    const tick = (ts: number) => {
      if (!startTs) startTs = ts
      const phase = ((ts - startTs) % periodMs) / periodMs
      const tri = phase < 0.5 ? phase * 2 : (1 - phase) * 2 // 0 -> 1 -> 0
      const next = Math.round(tri * n)
      if (next !== litRef.current) {
        litRef.current = next
        setAnimLit(next)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [reduced, play, period, n])

  const lit = reduced || !play ? n : animLit

  return (
    <span
      className={className ? `cs-ascii-arrow ${className}` : 'cs-ascii-arrow'}
      data-variant="ascii-arrow"
      aria-hidden="true"
    >
      {[...chars].map((c, i) => (
        <span
          key={i}
          style={{ color: i < lit ? spectrumAt(i / (n - 1)) : 'var(--cs-ascii-dim)' }}
        >
          {c}
        </span>
      ))}
    </span>
  )
}
