import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { useMagnifierInternal } from './MagnifierContext'
import { ExpandableCell, type CellAction } from './ExpandableCell'

function actions(onCall: () => void, onText: () => void): CellAction[] {
  return [
    { id: 'call', label: 'Call', tone: 'call', variant: 'primary', onAction: onCall },
    { id: 'text', label: 'Text', tone: 'text', variant: 'secondary', onAction: onText },
  ]
}

/** The cell now hands off to the magnifier driver, which needs the provider. */
function renderCell(ui: React.ReactNode) {
  return render(<MagnifierProvider>{ui}</MagnifierProvider>)
}

/**
 * Stub each chip's getBoundingClientRect so the hit-testing inside the cell
 * has something to chew on under jsdom.
 */
function stubChipRects() {
  const chips = document.querySelectorAll<HTMLElement>('[data-expandable-chip="true"]')
  let x = 100
  chips.forEach((chip) => {
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
  })
}

describe('ExpandableCell', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('fires onTap when tapped (short press, no movement)', () => {
    const onTap = vi.fn()
    renderCell(
      <ExpandableCell id="row-1" expansionAxis="vertical" onTap={onTap} actions={actions(vi.fn(), vi.fn())}>
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    act(() => { vi.advanceTimersByTime(100) })
    fireEvent.pointerUp(root, { pointerId: 1, clientX: 50, clientY: 50 })
    expect(onTap).toHaveBeenCalledTimes(1)
  })

  it('arms after a brief hold, then opens the menu on a sustained hold', () => {
    renderCell(
      <ExpandableCell id="row-1" expansionAxis="vertical" onTap={vi.fn()} actions={actions(vi.fn(), vi.fn())}>
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    expect(root.getAttribute('data-state')).toBe('pressing')

    act(() => { vi.advanceTimersByTime(200) })
    expect(root.getAttribute('data-state')).toBe('armed')

    act(() => { vi.advanceTimersByTime(320) }) // ~520ms total, past the menu hold
    expect(root.getAttribute('data-state')).toBe('expanded')
  })

  it('hands off to the magnifier when armed then slid', () => {
    renderCell(
      <ExpandableCell id="row-1" expansionAxis="vertical" onTap={vi.fn()} actions={actions(vi.fn(), vi.fn())}>
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    act(() => { vi.advanceTimersByTime(200) }) // arm
    // A decisive slide (>= 24pt) lifts into the magnifier session.
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 90, clientY: 52 })
    expect(root.getAttribute('data-state')).toBe('sliding')
  })

  it('yields the hold if the pointer moves before arming', () => {
    renderCell(
      <ExpandableCell id="row-1" expansionAxis="vertical" onTap={vi.fn()} actions={actions(vi.fn(), vi.fn())}>
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 80, clientY: 50 }) // 30pt, pre-arm
    act(() => { vi.advanceTimersByTime(600) })
    expect(root.getAttribute('data-state')).toBe('collapsed')
  })

  it('highlights the chip nearest the pointer when the menu is open', () => {
    renderCell(
      <ExpandableCell id="row-1" expansionAxis="vertical" onTap={vi.fn()} actions={actions(vi.fn(), vi.fn())}>
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    act(() => { vi.advanceTimersByTime(520) })
    stubChipRects()

    fireEvent.pointerMove(root, { pointerId: 1, clientX: 140, clientY: 100 })
    expect(screen.getByLabelText('Call').getAttribute('data-state')).toBe('hovered')

    fireEvent.pointerMove(root, { pointerId: 1, clientX: 240, clientY: 100 })
    expect(screen.getByLabelText('Text').getAttribute('data-state')).toBe('hovered')
  })

  it('fires the hovered chip onAction on lift', () => {
    const onCall = vi.fn()
    const onText = vi.fn()
    renderCell(
      <ExpandableCell id="row-1" expansionAxis="vertical" onTap={vi.fn()} actions={actions(onCall, onText)}>
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    act(() => { vi.advanceTimersByTime(520) })
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
    renderCell(
      <ExpandableCell id="row-1" expansionAxis="vertical" onTap={onTap} actions={actions(onCall, onText)}>
        <div>Sarah</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-row-1')
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 50, clientY: 50 })
    act(() => { vi.advanceTimersByTime(520) })
    stubChipRects()

    fireEvent.pointerUp(root, { pointerId: 1, clientX: 50, clientY: 600 })

    expect(onCall).not.toHaveBeenCalled()
    expect(onText).not.toHaveBeenCalled()
    expect(onTap).not.toHaveBeenCalled()
    expect(root.getAttribute('data-state')).toBe('collapsed')
  })

  it('opens its menu when the magnifier requests it, then fires the chip on lift', () => {
    const onCall = vi.fn()
    const onText = vi.fn()
    let requestMenu: ((id: string, p: { x: number; y: number }) => void) | null = null
    function Trigger() {
      requestMenu = useMagnifierInternal().requestMenu
      return null
    }
    render(
      <MagnifierProvider>
        <Trigger />
        <ExpandableCell id="row-1" expansionAxis="vertical" onTap={vi.fn()} actions={actions(onCall, onText)}>
          <div>Sarah</div>
        </ExpandableCell>
      </MagnifierProvider>,
    )
    const root = screen.getByTestId('expandable-row-1')
    expect(root.getAttribute('data-state')).toBe('collapsed')

    // The driver rested its lens here and asked for the menu (no pointerdown
    // ever landed on this cell; the gesture began elsewhere and slid over).
    act(() => { requestMenu!('row-1', { x: 140, y: 100 }) })
    expect(root.getAttribute('data-state')).toBe('expanded')

    stubChipRects()
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 140, clientY: 100 })
    fireEvent.pointerUp(root, { pointerId: 1, clientX: 140, clientY: 100 })
    expect(onCall).toHaveBeenCalledTimes(1)
    expect(onText).not.toHaveBeenCalled()
  })

  it('ignores a menu request addressed to another cell', () => {
    let requestMenu: ((id: string, p: { x: number; y: number }) => void) | null = null
    function Trigger() {
      requestMenu = useMagnifierInternal().requestMenu
      return null
    }
    render(
      <MagnifierProvider>
        <Trigger />
        <ExpandableCell id="row-1" expansionAxis="vertical" onTap={vi.fn()} actions={actions(vi.fn(), vi.fn())}>
          <div>Sarah</div>
        </ExpandableCell>
      </MagnifierProvider>,
    )
    const root = screen.getByTestId('expandable-row-1')
    act(() => { requestMenu!('row-2', { x: 0, y: 0 }) })
    expect(root.getAttribute('data-state')).toBe('collapsed')
  })

  it('exposes data-variant and data-expansion-axis for design-system export', () => {
    renderCell(
      <ExpandableCell id="dock-phone" expansionAxis="horizontal" variant="dock" actions={actions(vi.fn(), vi.fn())}>
        <div>Phone</div>
      </ExpandableCell>,
    )
    const root = screen.getByTestId('expandable-dock-phone')
    expect(root.getAttribute('data-variant')).toBe('dock')
    expect(root.getAttribute('data-expansion-axis')).toBe('horizontal')
    expect(root.getAttribute('data-state')).toBe('collapsed')
  })
})
