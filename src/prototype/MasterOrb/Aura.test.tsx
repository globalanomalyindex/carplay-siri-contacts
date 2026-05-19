import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Aura } from './Aura'

describe('Aura', () => {
  it('renders when active', () => {
    render(<Aura active />)
    expect(screen.getByTestId('siri-aura')).toBeInTheDocument()
  })

  it('does not render when inactive', () => {
    render(<Aura active={false} />)
    expect(screen.queryByTestId('siri-aura')).not.toBeInTheDocument()
  })
})
