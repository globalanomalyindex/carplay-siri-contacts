import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LiquidGlassFrame } from './LiquidGlassFrame'

describe('LiquidGlassFrame', () => {
  it('renders children inside the frame', () => {
    render(
      <LiquidGlassFrame>
        <span data-testid="inner">x</span>
      </LiquidGlassFrame>,
    )
    expect(screen.getByTestId('inner')).toBeInTheDocument()
  })

  it('applies bright border style when bright prop is true', () => {
    const { container } = render(
      <LiquidGlassFrame bright>
        <span>x</span>
      </LiquidGlassFrame>,
    )
    const frame = container.firstChild as HTMLElement
    expect(frame.style.borderColor).toContain('255, 255, 255')
  })
})
