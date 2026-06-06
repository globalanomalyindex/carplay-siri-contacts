import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRef } from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { FirstRunCoach } from './FirstRunCoach'
import { resetCoachGate } from './coachGate'

/**
 * A minimal stand-in for the CarPlay screen: a bounds element containing the
 * orb hit target and one magnifiable contact row, the two anchors the coach
 * measures. jsdom returns zero rects, which is fine: the coach still produces a
 * geometry object and renders, which is what these tests assert on.
 */
function CoachHarness() {
  const screenRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={screenRef} data-testid="carplay-screen-bounds" style={{ position: 'relative' }}>
      <div data-testid="master-orb-hit" />
      <div data-testid="magnifiable-contact-row-1" />
      <FirstRunCoach screenRef={screenRef} />
    </div>
  )
}

describe('FirstRunCoach gating', () => {
  beforeEach(() => {
    resetCoachGate()
  })

  it('plays once and renders the demonstration on first mount', async () => {
    render(<CoachHarness />)
    await waitFor(() => {
      expect(screen.getByTestId('first-run-coach')).toBeInTheDocument()
    })
  })

  it('does not replay on a later mount in the same session', async () => {
    const first = render(<CoachHarness />)
    await waitFor(() => {
      expect(screen.getByTestId('first-run-coach')).toBeInTheDocument()
    })
    first.unmount()

    // A second instance (e.g. the standalone route after the embedded one) must
    // not play again: the gate was claimed on the first play.
    render(<CoachHarness />)
    // Give the measure effect a tick; the coach should never appear.
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.queryByTestId('first-run-coach')).not.toBeInTheDocument()
  })

  it('dismisses immediately on a real pointer interaction', async () => {
    render(<CoachHarness />)
    await waitFor(() => {
      expect(screen.getByTestId('first-run-coach')).toBeInTheDocument()
    })
    fireEvent.pointerDown(screen.getByTestId('carplay-screen-bounds'))
    await waitFor(() => {
      expect(screen.queryByTestId('first-run-coach')).not.toBeInTheDocument()
    })
  })

  it('dismisses immediately on a key press', async () => {
    render(<CoachHarness />)
    await waitFor(() => {
      expect(screen.getByTestId('first-run-coach')).toBeInTheDocument()
    })
    fireEvent.keyDown(window, { key: 'Tab' })
    await waitFor(() => {
      expect(screen.queryByTestId('first-run-coach')).not.toBeInTheDocument()
    })
  })

  it('is purely presentational (aria-hidden, pointer-events none)', async () => {
    render(<CoachHarness />)
    const coach = await screen.findByTestId('first-run-coach')
    expect(coach).toHaveAttribute('aria-hidden')
    expect(coach.style.pointerEvents).toBe('none')
  })
})

describe('FirstRunCoach reduced motion', () => {
  beforeEach(() => {
    resetCoachGate()
  })

  it('renders the static hint variant when reduced motion is on', async () => {
    const mql = (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(mql),
    })

    render(<CoachHarness />)
    const coach = await screen.findByTestId('first-run-coach')
    expect(coach).toHaveAttribute('data-mode', 'static')

    // Restore so other suites read non-reduced.
    Object.defineProperty(window, 'matchMedia', { writable: true, value: undefined })
  })
})
