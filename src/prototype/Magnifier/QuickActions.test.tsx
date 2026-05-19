import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { QuickActions } from './QuickActions'
import { pickQuickActionDirection } from './quickActionsGeometry'
import type { QuickAction } from './types'

function dispatchPointer(type: string, x: number, y: number) {
  const evt = new PointerEvent(type, {
    bubbles: true, cancelable: true, pointerId: 1,
    clientX: x, clientY: y,
  })
  window.dispatchEvent(evt)
}

const callAction: QuickAction = {
  id: 'call',
  label: 'Call',
  position: 'up',
  icon: <span>C</span>,
  onAction: vi.fn(),
}
const textAction: QuickAction = {
  id: 'text',
  label: 'Text',
  position: 'down',
  icon: <span>T</span>,
  onAction: vi.fn(),
}

describe('pickQuickActionDirection', () => {
  it('returns null inside the deadzone', () => {
    expect(pickQuickActionDirection({ x: 100, y: 100 }, { x: 102, y: 101 })).toBe(null)
  })
  it('classifies up / down / left / right by dominant axis', () => {
    expect(pickQuickActionDirection({ x: 100, y: 100 }, { x: 100, y: 40 })).toBe('up')
    expect(pickQuickActionDirection({ x: 100, y: 100 }, { x: 100, y: 160 })).toBe('down')
    expect(pickQuickActionDirection({ x: 100, y: 100 }, { x: 40, y: 100 })).toBe('left')
    expect(pickQuickActionDirection({ x: 100, y: 100 }, { x: 160, y: 100 })).toBe('right')
  })
  it('prefers horizontal on a tie', () => {
    expect(pickQuickActionDirection({ x: 100, y: 100 }, { x: 140, y: 140 })).toBe('right')
    expect(pickQuickActionDirection({ x: 100, y: 100 }, { x: 60,  y: 140 })).toBe('left')
  })
})

describe('QuickActions', () => {
  it('renders one chip per action', () => {
    render(
      <QuickActions
        anchor={{ x: 300, y: 200 }}
        actions={[callAction, textAction]}
        onClose={() => {}}
      />,
    )
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
    expect(screen.getByTestId('quick-action-call')).toBeInTheDocument()
    expect(screen.getByTestId('quick-action-text')).toBeInTheDocument()
  })

  it('highlights the chip in the dragged direction', () => {
    render(
      <QuickActions
        anchor={{ x: 300, y: 200 }}
        actions={[callAction, textAction]}
        onClose={() => {}}
      />,
    )

    // Move up: 'up' chip (call) should highlight.
    act(() => { dispatchPointer('pointermove', 300, 100) })
    expect(screen.getByTestId('quick-action-call').getAttribute('data-state')).toBe('highlighted')
    expect(screen.getByTestId('quick-action-text').getAttribute('data-state')).toBe('idle')

    // Move down: 'down' chip (text) should highlight.
    act(() => { dispatchPointer('pointermove', 300, 320) })
    expect(screen.getByTestId('quick-action-text').getAttribute('data-state')).toBe('highlighted')
    expect(screen.getByTestId('quick-action-call').getAttribute('data-state')).toBe('idle')
  })

  it('fires the targeted action onAction and onClose on pointer up', () => {
    const onCall = vi.fn()
    const onClose = vi.fn()
    const actions: QuickAction[] = [
      { ...callAction, onAction: onCall },
      textAction,
    ]

    render(
      <QuickActions anchor={{ x: 300, y: 200 }} actions={actions} onClose={onClose} />,
    )

    act(() => { dispatchPointer('pointermove', 300, 100) })
    act(() => { dispatchPointer('pointerup', 300, 100) })

    expect(onCall).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('dismisses without firing when lifted inside the deadzone', () => {
    const onCall = vi.fn()
    const onText = vi.fn()
    const onClose = vi.fn()
    const actions: QuickAction[] = [
      { ...callAction, onAction: onCall },
      { ...textAction, onAction: onText },
    ]

    render(
      <QuickActions anchor={{ x: 300, y: 200 }} actions={actions} onClose={onClose} />,
    )

    // Lift right at the anchor (inside deadzone).
    act(() => { dispatchPointer('pointerup', 302, 201) })

    expect(onCall).not.toHaveBeenCalled()
    expect(onText).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ignores directions that have no assigned action', () => {
    // Only up + down provided; dragging right should not highlight anything.
    render(
      <QuickActions
        anchor={{ x: 300, y: 200 }}
        actions={[callAction, textAction]}
        onClose={() => {}}
      />,
    )

    act(() => { dispatchPointer('pointermove', 420, 200) })

    expect(screen.getByTestId('quick-action-call').getAttribute('data-state')).toBe('idle')
    expect(screen.getByTestId('quick-action-text').getAttribute('data-state')).toBe('idle')
  })
})
