import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MagnifierProvider } from '../Magnifier'
import { MusicSketch } from './MusicSketch'

describe('MusicSketch', () => {
  it('shows Now Playing track info', () => {
    render(
      <MagnifierProvider>
        <MusicSketch />
      </MagnifierProvider>,
    )
    expect(screen.getByTestId('now-playing-title')).toBeInTheDocument()
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
  })

  it('renders queue rows', () => {
    render(
      <MagnifierProvider>
        <MusicSketch />
      </MagnifierProvider>,
    )
    expect(screen.getAllByTestId(/^queue-row-/).length).toBeGreaterThanOrEqual(3)
  })
})
