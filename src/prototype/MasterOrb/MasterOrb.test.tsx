import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MasterOrb } from './MasterOrb'

describe('MasterOrb', () => {
  it('renders idle with no aura', () => {
    render(<MasterOrb />)
    expect(screen.getByTestId('master-orb')).toBeInTheDocument()
    expect(screen.queryByTestId('siri-aura')).not.toBeInTheDocument()
  })

  it('shows aura after a tap (Siri active)', () => {
    render(<MasterOrb />)
    const hit = screen.getByTestId('master-orb-hit')
    fireEvent.pointerDown(hit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerUp(hit, { pointerId: 1, clientX: 10, clientY: 10 })
    expect(screen.getByTestId('siri-aura')).toBeInTheDocument()
  })

  it('hides aura after a second tap (Siri canceled)', async () => {
    render(<MasterOrb />)
    const hit = screen.getByTestId('master-orb-hit')
    fireEvent.pointerDown(hit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerUp(hit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerDown(hit, { pointerId: 2, clientX: 10, clientY: 10 })
    fireEvent.pointerUp(hit, { pointerId: 2, clientX: 10, clientY: 10 })
    // AnimatePresence runs an exit animation; wait for the element to leave the DOM.
    await waitFor(() => {
      expect(screen.queryByTestId('siri-aura')).not.toBeInTheDocument()
    })
  })
})
