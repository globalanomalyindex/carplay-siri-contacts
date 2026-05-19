import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CarPlayChrome } from './CarPlayChrome'

describe('CarPlayChrome', () => {
  it('renders status bar, orb home slot, dock, and app content slot', () => {
    render(
      <CarPlayChrome
        orbHome={<div data-testid="orb-home">orb</div>}
        dock={<div data-testid="dock-content">dock</div>}
      >
        <div data-testid="app-content">app</div>
      </CarPlayChrome>,
    )

    expect(screen.getByTestId('carplay-status-bar')).toBeInTheDocument()
    expect(screen.getByTestId('orb-home')).toBeInTheDocument()
    expect(screen.getByTestId('dock-content')).toBeInTheDocument()
    expect(screen.getByTestId('app-content')).toBeInTheDocument()
  })

  it('places the orb home above the dock in the left column', () => {
    const { container } = render(
      <CarPlayChrome
        orbHome={<div data-testid="orb-home">orb</div>}
        dock={<div data-testid="dock-content">dock</div>}
      >
        <div>app</div>
      </CarPlayChrome>,
    )

    const leftCol = container.querySelector('[data-testid="carplay-left-col"]')
    expect(leftCol).toBeInTheDocument()
    const children = Array.from(leftCol!.children)
    const orbIndex = children.findIndex((c) => c.querySelector('[data-testid="orb-home"]'))
    const dockIndex = children.findIndex((c) => c.querySelector('[data-testid="dock-content"]'))
    expect(orbIndex).toBeLessThan(dockIndex)
  })
})
