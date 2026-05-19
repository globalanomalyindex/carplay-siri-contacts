import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../../a11y/useReducedMotion'

export interface PullQuoteProps {
  children: ReactNode
  cite?: ReactNode
}

/**
 * Large centered pull quote. Scales in from 0.95 to 1.0 when entering
 * the viewport. Honors reduced motion (renders statically).
 */
export function PullQuote({ children, cite }: PullQuoteProps) {
  const reduced = useReducedMotion()
  return (
    <motion.blockquote
      className="cs-pullquote"
      initial={reduced ? false : { opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1.0] }}
    >
      <p style={{ margin: 0 }}>{children}</p>
      {cite && <cite>{cite}</cite>}
    </motion.blockquote>
  )
}
