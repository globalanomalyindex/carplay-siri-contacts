import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MisCommitChart } from './MisCommitChart'
import { EXPERIMENT_RESULTS } from '../data/experimentResults'

describe('MisCommitChart', () => {
  it('renders an element with role img', () => {
    render(<MisCommitChart data={EXPERIMENT_RESULTS} />)
    expect(screen.getByRole('img')).toBeTruthy()
  })

  it('renders exactly 3 data rows in the sr-only table', () => {
    render(<MisCommitChart data={EXPERIMENT_RESULTS} />)
    // The table body rows correspond to the three tremor tiers.
    const rows = document.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(3)
  })

  it('renders without throwing under reduced motion', () => {
    // Mock the media query to simulate prefers-reduced-motion.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    })

    expect(() =>
      render(<MisCommitChart data={EXPERIMENT_RESULTS} />),
    ).not.toThrow()
  })
})
