import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { OrbControlProvider } from './OrbControlProvider'
import { MasterOrb } from './MasterOrb'
import { MagnifierProvider } from '../Magnifier/MagnifierProvider'
import { useGlobalSiriDismiss } from './useGlobalSiriDismiss'

function Shell() {
  useGlobalSiriDismiss()
  return null
}

describe('useGlobalSiriDismiss', () => {
  it('dismisses Siri when the user taps anywhere outside the orb', async () => {
    render(
      <OrbControlProvider>
        <MagnifierProvider>
          <Shell />
          <MasterOrb />
          <div data-testid="elsewhere" style={{ width: 100, height: 100 }} />
        </MagnifierProvider>
      </OrbControlProvider>,
    )

    // Activate Siri with a tap on the orb.
    const orbHit = screen.getByTestId('master-orb-hit')
    fireEvent.pointerDown(orbHit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerUp(orbHit, { pointerId: 1, clientX: 10, clientY: 10 })
    expect(screen.getByTestId('siri-aura')).toBeInTheDocument()

    // Now tap somewhere else. Use a window pointerdown so the hook's window
    // listener actually fires (target is the elsewhere element).
    await act(async () => {
      const elsewhere = screen.getByTestId('elsewhere')
      const evt = new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerId: 2,
        clientX: 200,
        clientY: 200,
      })
      Object.defineProperty(evt, 'target', { value: elsewhere })
      window.dispatchEvent(evt)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('siri-aura')).not.toBeInTheDocument()
    })
  })

  it('does not dismiss when tap is on the orb (orb handles its own TAP)', () => {
    render(
      <OrbControlProvider>
        <MagnifierProvider>
          <Shell />
          <MasterOrb />
        </MagnifierProvider>
      </OrbControlProvider>,
    )

    const orbHit = screen.getByTestId('master-orb-hit')
    fireEvent.pointerDown(orbHit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerUp(orbHit, { pointerId: 1, clientX: 10, clientY: 10 })
    expect(screen.getByTestId('siri-aura')).toBeInTheDocument()

    // Simulate a window-level pointerdown whose target is the orb. The hook
    // should see closest('[data-testid=master-orb-hit]') match and skip.
    const evt = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerId: 2,
      clientX: 10,
      clientY: 10,
    })
    Object.defineProperty(evt, 'target', { value: orbHit })
    window.dispatchEvent(evt)

    expect(screen.getByTestId('siri-aura')).toBeInTheDocument()
  })
})
