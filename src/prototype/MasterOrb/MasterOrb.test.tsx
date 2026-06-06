import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MasterOrb } from './MasterOrb'
import { MagnifierProvider } from '../Magnifier/MagnifierProvider'

describe('MasterOrb', () => {
  it('renders idle with no aura', () => {
    render(<MagnifierProvider><MasterOrb /></MagnifierProvider>)
    expect(screen.getByTestId('master-orb')).toBeInTheDocument()
    expect(screen.queryByTestId('siri-aura')).not.toBeInTheDocument()
  })

  it('shows aura after a tap (Siri active)', () => {
    render(<MagnifierProvider><MasterOrb /></MagnifierProvider>)
    const hit = screen.getByTestId('master-orb-hit')
    fireEvent.pointerDown(hit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerUp(hit, { pointerId: 1, clientX: 10, clientY: 10 })
    expect(screen.getByTestId('siri-aura')).toBeInTheDocument()
  })

  it('hides aura after a second tap (Siri canceled)', async () => {
    render(<MagnifierProvider><MasterOrb /></MagnifierProvider>)
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

describe('MasterOrb keyboard path', () => {
  it('exposes the orb as a focusable button labelled Wake Siri', () => {
    render(<MagnifierProvider><MasterOrb /></MagnifierProvider>)
    const hit = screen.getByTestId('master-orb-hit')
    expect(hit).toHaveAttribute('role', 'button')
    expect(hit).toHaveAttribute('tabindex', '0')
    expect(hit).toHaveAttribute('aria-label', 'Wake Siri')
    expect(hit).toHaveAttribute('aria-pressed', 'false')
  })

  it('wakes Siri on Enter (same primary action as a tap)', () => {
    render(<MagnifierProvider><MasterOrb /></MagnifierProvider>)
    const hit = screen.getByTestId('master-orb-hit')
    fireEvent.keyDown(hit, { key: 'Enter' })
    expect(screen.getByTestId('siri-aura')).toBeInTheDocument()
    expect(hit).toHaveAttribute('aria-pressed', 'true')
  })

  it('wakes Siri on Space and prevents default scroll', () => {
    render(<MagnifierProvider><MasterOrb /></MagnifierProvider>)
    const hit = screen.getByTestId('master-orb-hit')
    const ev = fireEvent.keyDown(hit, { key: ' ' })
    expect(screen.getByTestId('siri-aura')).toBeInTheDocument()
    expect(ev).toBe(false)
  })

  it('ignores other keys', () => {
    render(<MagnifierProvider><MasterOrb /></MagnifierProvider>)
    const hit = screen.getByTestId('master-orb-hit')
    fireEvent.keyDown(hit, { key: 'a' })
    expect(screen.queryByTestId('siri-aura')).not.toBeInTheDocument()
  })
})

describe('MasterOrb drag', () => {
  it('enters rotary mode on drag past threshold', () => {
    render(<MagnifierProvider><MasterOrb /></MagnifierProvider>)
    const hit = screen.getByTestId('master-orb-hit')
    fireEvent.pointerDown(hit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(hit, { pointerId: 1, clientX: 30, clientY: 10 })
    expect(screen.queryByTestId('master-orb')).not.toBeInTheDocument()
  })

  it('returns to idle on pointer up in rotary mode', async () => {
    render(<MagnifierProvider><MasterOrb /></MagnifierProvider>)
    const hit = screen.getByTestId('master-orb-hit')
    fireEvent.pointerDown(hit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(hit, { pointerId: 1, clientX: 30, clientY: 10 })
    fireEvent.pointerUp(hit, { pointerId: 1, clientX: 30, clientY: 10 })
    expect(screen.getByTestId('master-orb')).toBeInTheDocument()
  })
})
