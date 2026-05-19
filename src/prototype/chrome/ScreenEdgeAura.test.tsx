import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScreenEdgeAura } from './ScreenEdgeAura'

describe('ScreenEdgeAura', () => {
  it('renders when active', () => {
    render(<ScreenEdgeAura active />)
    expect(screen.getByTestId('screen-edge-aura')).toBeInTheDocument()
  })

  it('does not render when inactive', () => {
    render(<ScreenEdgeAura active={false} />)
    expect(screen.queryByTestId('screen-edge-aura')).not.toBeInTheDocument()
  })
})
