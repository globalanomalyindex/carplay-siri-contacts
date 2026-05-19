import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface CounterProps {
  /** Final value to count to. */
  value: number
  /** Optional prefix (e.g. '~') and suffix (e.g. 'M', '%') for display. */
  prefix?: string
  suffix?: string
  /** Animation duration in ms. */
  duration?: number
}

/**
 * Animated count-up. Triggers once when the element enters the viewport.
 * Honors reduced motion (renders the final value immediately).
 *
 * Renders the final value as text for screen readers even during the
 * animation so assistive tech reads the accurate number.
 */
export function Counter({ value, prefix = '', suffix = '', duration = 1400 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const reduced = useReducedMotion()
  const [displayed, setDisplayed] = useState(reduced ? value : 0)

  useEffect(() => {
    if (!inView || reduced) return
    let raf = 0
    const start = performance.now()
    const startVal = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - k, 3)
      setDisplayed(Math.round(startVal + (value - startVal) * eased))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration, reduced])

  const finalText = `${prefix}${value.toLocaleString()}${suffix}`
  return (
    <span ref={ref} aria-label={finalText}>
      <span aria-hidden="true">
        {prefix}
        {displayed.toLocaleString()}
        {suffix}
      </span>
    </span>
  )
}
