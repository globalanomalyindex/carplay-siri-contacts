import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DockSwitcher } from './DockSwitcher'

describe('DockSwitcher', () => {
  it('renders the four surface buttons', () => {
    render(<DockSwitcher surface="phone" onSelect={() => {}} />)
    expect(screen.getByTestId('dock-phone')).toBeInTheDocument()
    expect(screen.getByTestId('dock-music')).toBeInTheDocument()
    expect(screen.getByTestId('dock-maps')).toBeInTheDocument()
    expect(screen.getByTestId('dock-dialer')).toBeInTheDocument()
  })

  it('marks the active surface with aria-pressed=true and data-active', () => {
    render(<DockSwitcher surface="maps" onSelect={() => {}} />)
    const mapsBtn = screen.getByTestId('dock-maps')
    expect(mapsBtn.getAttribute('aria-pressed')).toBe('true')
    expect(mapsBtn.getAttribute('data-active')).toBe('true')
    const phoneBtn = screen.getByTestId('dock-phone')
    expect(phoneBtn.getAttribute('aria-pressed')).toBe('false')
    expect(phoneBtn.hasAttribute('data-active')).toBe(false)
  })

  it('fires onSelect with the right surface id on click', () => {
    const onSelect = vi.fn()
    render(<DockSwitcher surface="phone" onSelect={onSelect} />)
    fireEvent.click(screen.getByTestId('dock-music'))
    expect(onSelect).toHaveBeenCalledWith('music')
    fireEvent.click(screen.getByTestId('dock-dialer'))
    expect(onSelect).toHaveBeenCalledWith('dialer')
  })
})
