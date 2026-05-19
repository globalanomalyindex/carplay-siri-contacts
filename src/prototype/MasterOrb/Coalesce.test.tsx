import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Coalesce } from './Coalesce'

describe('Coalesce', () => {
  it('renders particles when active', () => {
    render(
      <Coalesce
        active
        from={{ x: 200, y: 200 }}
        to={{ x: 50, y: 50 }}
      />,
    )
    const particles = screen.getAllByTestId('coalesce-particle')
    expect(particles.length).toBeGreaterThanOrEqual(8)
    expect(particles.length).toBeLessThanOrEqual(12)
  })

  it('renders nothing when inactive', () => {
    render(
      <Coalesce
        active={false}
        from={{ x: 200, y: 200 }}
        to={{ x: 50, y: 50 }}
      />,
    )
    expect(screen.queryByTestId('coalesce-particle')).not.toBeInTheDocument()
  })
})
