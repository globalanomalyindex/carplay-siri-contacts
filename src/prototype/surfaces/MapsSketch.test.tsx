import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MagnifierProvider } from '../Magnifier'
import { MapsSketch } from './MapsSketch'

describe('MapsSketch', () => {
  it('renders quick-control chips and POI pins', () => {
    render(
      <MagnifierProvider>
        <MapsSketch />
      </MagnifierProvider>,
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Gas')).toBeInTheDocument()
    expect(screen.getAllByTestId(/^poi-pin-/).length).toBeGreaterThan(0)
  })

  it('renders the free-drift map canvas', () => {
    render(
      <MagnifierProvider>
        <MapsSketch />
      </MagnifierProvider>,
    )
    expect(screen.getByTestId('map-canvas')).toBeInTheDocument()
  })
})
