import { describe, it, expect, vi } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import { DockSwitcher } from './DockSwitcher'
import { MagnifierProvider } from '../Magnifier'
import { ToastProvider } from '../Toast'

function renderInProvider(ui: React.ReactElement) {
  return render(
    <MagnifierProvider>
      <ToastProvider>{ui}</ToastProvider>
    </MagnifierProvider>,
  )
}

describe('DockSwitcher', () => {
  it('renders the three surface buttons', () => {
    renderInProvider(<DockSwitcher surface="phone" onSelect={() => {}} />)
    expect(screen.getByTestId('dock-phone')).toBeInTheDocument()
    expect(screen.getByTestId('dock-music')).toBeInTheDocument()
    expect(screen.getByTestId('dock-maps')).toBeInTheDocument()
    expect(screen.queryByTestId('dock-dialer')).not.toBeInTheDocument()
  })

  it('marks the active surface with aria-pressed=true on the interactive frame and data-active on the glyph', () => {
    renderInProvider(<DockSwitcher surface="maps" onSelect={() => {}} />)
    // aria-pressed lives on the single interactive node (the MagnifiableFrame),
    // so the accessibility tree has exactly one button per control. The inner
    // glyph carries only data-active for styling and is not interactive.
    const mapsFrame = screen.getByTestId('magnifiable-dock-maps')
    expect(mapsFrame.getAttribute('aria-pressed')).toBe('true')
    expect(mapsFrame.getAttribute('role')).toBe('button')
    expect(screen.getByTestId('dock-maps').getAttribute('data-active')).toBe('true')

    const phoneFrame = screen.getByTestId('magnifiable-dock-phone')
    expect(phoneFrame.getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByTestId('dock-phone').hasAttribute('data-active')).toBe(false)
  })

  it('fires onSelect with the right surface id on tap', () => {
    vi.useFakeTimers()
    const onSelect = vi.fn()
    renderInProvider(<DockSwitcher surface="phone" onSelect={onSelect} />)
    // A tap is a short press + lift on the ExpandableCell wrapper. The dock
    // item itself is a div; tapping the wrapper triggers the cell's onTap.
    const musicCell = screen.getByTestId('expandable-dock-music')
    fireEvent.pointerDown(musicCell, { pointerId: 1, clientX: 30, clientY: 30 })
    act(() => { vi.advanceTimersByTime(50) })
    fireEvent.pointerUp(musicCell, { pointerId: 1, clientX: 30, clientY: 30 })

    const mapsCell = screen.getByTestId('expandable-dock-maps')
    fireEvent.pointerDown(mapsCell, { pointerId: 2, clientX: 30, clientY: 30 })
    act(() => { vi.advanceTimersByTime(50) })
    fireEvent.pointerUp(mapsCell, { pointerId: 2, clientX: 30, clientY: 30 })

    expect(onSelect).toHaveBeenNthCalledWith(1, 'music')
    expect(onSelect).toHaveBeenNthCalledWith(2, 'maps')
    vi.useRealTimers()
  })

  it('registers each dock item as a magnifiable target with id dock-<surface>', () => {
    renderInProvider(<DockSwitcher surface="phone" onSelect={() => {}} />)
    expect(screen.getByTestId('magnifiable-dock-phone')).toBeInTheDocument()
    expect(screen.getByTestId('magnifiable-dock-music')).toBeInTheDocument()
    expect(screen.getByTestId('magnifiable-dock-maps')).toBeInTheDocument()
  })

  it('wraps each dock item in an ExpandableCell with horizontal axis', () => {
    renderInProvider(<DockSwitcher surface="phone" onSelect={() => {}} />)
    const phone = screen.getByTestId('expandable-dock-phone')
    expect(phone.getAttribute('data-variant')).toBe('dock')
    expect(phone.getAttribute('data-expansion-axis')).toBe('horizontal')
  })
})
