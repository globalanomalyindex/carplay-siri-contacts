import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Orb } from './Orb'

describe('Orb', () => {
  it('renders an orb with the Siri conic gradient', () => {
    render(<Orb />)
    const orb = screen.getByTestId('master-orb')
    expect(orb).toBeInTheDocument()
    expect(orb.style.background).toContain('conic-gradient')
  })

  it('accepts a size prop and applies it', () => {
    render(<Orb size={20} />)
    const orb = screen.getByTestId('master-orb')
    expect(orb.style.width).toBe('20px')
    expect(orb.style.height).toBe('20px')
  })
})
