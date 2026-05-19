import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import { ExpandableCell, type CellAction } from './ExpandableCell'

function actions(onCall: () => void, onText: () => void): CellAction[] {
  return [
    { id: 'call', label: 'Call', tone: 'call', variant: 'primary', onAction: onCall },
    { id: 'text', label: 'Text', tone: 'text', variant: 'secondary', onAction: onText },
  ]
}

/**
 * Stub each chip's getBoundingClientRect so the hit-testing inside the cell
 * has something to chew on under jsdom.
 */
function stubChipRects() {
  const chips = document.querySelectorAll<HTMLElement>('[data-expandable-chip="true"]')
  let x = 100
  chips.forEach((chip) => {
    const id = chip.dataset.actionId
    const rect = {
      x,
      y: 80,
      left: x,
      top: 80,
      right: x + 80,
      bottom: 124,
      width: 80,
      height: 44,
      toJSON: () => ({}),
    } as DOMRect
    chip.getBoundingClientRect = () => rect
    chip.dataset.stubX = String(x)
    x += 100
    void id // satisfy lint about unused id
  })
}

describe('ExpandableCell', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('fires onTap when tapped (short press, no movement)', () => {
    const onTap = vi.fn()
    render(
      <ExpandableCell
        id="row-1"
        expansionAxis="vertical"
        onTap={onTap}
        actions={actions(vi.fn(), vi.fn())}
      >
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    act(() => { vi.advanceTimersByTime(100) })
    fireEvent.pointerUp(root, { pointerId: 1, clientX: 50, clientY: 50 })
    expect(onTap).toHaveBeenCalledTimes(1)
  })

  it('enters expanded state after a sustained hold without movement', () => {
    render(
      <ExpandableCell
        id="row-1"
        expansionAxis="vertical"
        onTap={vi.fn()}
        actions={actions(vi.fn(), vi.fn())}
      >
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    expect(root.getAttribute('data-state')).toBe('pressing')

    act(() => { vi.advanceTimersByTime(280) })
    expect(root.getAttribute('data-state')).toBe('expanded')
  })

  it('cancels the hold if the pointer moves past the drag threshold', () => {
    render(
      <ExpandableCell
        id="row-1"
        expansionAxis="vertical"
        onTap={vi.fn()}
        actions={actions(vi.fn(), vi.fn())}
      >
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 80, clientY: 50 })
    act(() => { vi.advanceTimersByTime(300) })
    expect(root.getAttribute('data-state')).toBe('collapsed')
  })

  it('highlights the chip nearest the pointer when expanded', () => {
    render(
      <ExpandableCell
        id="row-1"
        expansionAxis="vertical"
        onTap={vi.fn()}
        actions={actions(vi.fn(), vi.fn())}
      >
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    act(() => { vi.advanceTimersByTime(280) })
    stubChipRects()

    // First chip at x in [100, 180].
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 140, clientY: 100 })
    const callChip = screen.getByLabelText('Call')
    expect(callChip.getAttribute('data-state')).toBe('hovered')

    // Second chip at x in [200, 280].
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 240, clientY: 100 })
    const textChip = screen.getByLabelText('Text')
    expect(textChip.getAttribute('data-state')).toBe('hovered')
  })

  it('fires the hovered chip onAction on lift', () => {
    const onCall = vi.fn()
    const onText = vi.fn()
    render(
      <ExpandableCell
        id="row-1"
        expansionAxis="vertical"
        onTap={vi.fn()}
        actions={actions(onCall, onText)}
      >
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    act(() => { vi.advanceTimersByTime(280) })
    stubChipRects()

    fireEvent.pointerMove(root, { pointerId: 1, clientX: 140, clientY: 100 })
    fireEvent.pointerUp(root, { pointerId: 1, clientX: 140, clientY: 100 })

    expect(onCall).toHaveBeenCalledTimes(1)
    expect(onText).not.toHaveBeenCalled()
  })

  it('collapses without firing if lifted away from any chip', () => {
    const onCall = vi.fn()
    const onText = vi.fn()
    const onTap = vi.fn()
    render(
      <ExpandableCell
        id="row-1"
        expansionAxis="vertical"
        onTap={onTap}
        actions={actions(onCall, onText)}
      >
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    act(() => { vi.advanceTimersByTime(280) })
    stubChipRects()

    // Lift far below the chip cluster (chips live around y=80-124).
    fireEvent.pointerUp(root, { pointerId: 1, clientX: 50, clientY: 600 })

    expect(onCall).not.toHaveBeenCalled()
    expect(onText).not.toHaveBeenCalled()
    expect(onTap).not.toHaveBeenCalled()
    expect(root.getAttribute('data-state')).toBe('collapsed')
  })

  it('exposes data-variant and data-expansion-axis for design-system export', () => {
    render(
      <ExpandableCell
        id="dock-phone"
        expansionAxis="horizontal"
        variant="dock"
        actions={actions(vi.fn(), vi.fn())}
      >
        <div>Phone</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-dock-phone')
    expect(root.getAttribute('data-variant')).toBe('dock')
    expect(root.getAttribute('data-expansion-axis')).toBe('horizontal')
    expect(root.getAttribute('data-state')).toBe('collapsed')
  })
})
