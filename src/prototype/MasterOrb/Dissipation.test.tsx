import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dissipation } from './Dissipation'

describe('Dissipation', () => {
  it('renders particles when active', () => {
    render(<Dissipation active center={{ x: 50, y: 50 }} />)
    const particles = screen.getAllByTestId('dissipation-particle')
    expect(particles.length).toBeGreaterThanOrEqual(8)
    expect(particles.length).toBeLessThanOrEqual(12)
  })

  it('renders nothing when inactive', () => {
    render(<Dissipation active={false} center={{ x: 50, y: 50 }} />)
    expect(screen.queryByTestId('dissipation-particle')).not.toBeInTheDocument()
  })
})
