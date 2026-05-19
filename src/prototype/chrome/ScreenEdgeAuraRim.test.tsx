import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScreenEdgeAuraRim } from './ScreenEdgeAuraRim'

describe('ScreenEdgeAuraRim', () => {
  it('renders when active', () => {
    render(<ScreenEdgeAuraRim active />)
    expect(screen.getByTestId('screen-edge-aura-rim')).toBeInTheDocument()
  })

  it('does not render when inactive', () => {
    render(<ScreenEdgeAuraRim active={false} />)
    expect(screen.queryByTestId('screen-edge-aura-rim')).not.toBeInTheDocument()
  })
})
