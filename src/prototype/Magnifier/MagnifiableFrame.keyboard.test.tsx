import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { MagnifiableFrame } from './MagnifiableFrame'
import { DockSwitcher } from '../chrome/DockSwitcher'
import { TabPill } from '../phone/TabPill'
import { ToastProvider } from '../Toast'

function inProvider(ui: React.ReactNode) {
  return render(
    <MagnifierProvider>
      <ToastProvider>{ui}</ToastProvider>
    </MagnifierProvider>,
  )
}

describe('MagnifiableFrame keyboard path', () => {
  it('is reachable by Tab (tabIndex 0) with role button and an accessible label', () => {
    inProvider(
      <MagnifiableFrame id="row-1" onCommit={() => {}} label="Call Ada">
        <span>row</span>
      </MagnifiableFrame>,
    )
    const frame = screen.getByTestId('magnifiable-row-1')
    expect(frame).toHaveAttribute('tabindex', '0')
    expect(frame).toHaveAttribute('role', 'button')
    expect(frame).toHaveAttribute('aria-label', 'Call Ada')
  })

  it('fires the same onCommit on Enter as a tap-lift commit', () => {
    const onCommit = vi.fn()
    inProvider(
      <MagnifiableFrame id="row-2" onCommit={onCommit} label="Call Ada">
        <span>row</span>
      </MagnifiableFrame>,
    )
    fireEvent.keyDown(screen.getByTestId('magnifiable-row-2'), { key: 'Enter' })
    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it('fires onCommit on Space and prevents the default page scroll', () => {
    const onCommit = vi.fn()
    inProvider(
      <MagnifiableFrame id="row-3" onCommit={onCommit} label="Call Ada">
        <span>row</span>
      </MagnifiableFrame>,
    )
    const ev = fireEvent.keyDown(screen.getByTestId('magnifiable-row-3'), { key: ' ' })
    expect(onCommit).toHaveBeenCalledTimes(1)
    // fireEvent returns false when preventDefault was called.
    expect(ev).toBe(false)
  })

  it('ignores keys other than Enter / Space', () => {
    const onCommit = vi.fn()
    inProvider(
      <MagnifiableFrame id="row-4" onCommit={onCommit} label="Call Ada">
        <span>row</span>
      </MagnifiableFrame>,
    )
    fireEvent.keyDown(screen.getByTestId('magnifiable-row-4'), { key: 'a' })
    fireEvent.keyDown(screen.getByTestId('magnifiable-row-4'), { key: 'Tab' })
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('reflects selection as aria-pressed and emits none when unset', () => {
    const { rerender } = inProvider(
      <MagnifiableFrame id="row-5" onCommit={() => {}} label="A" selected={false}>
        <span>row</span>
      </MagnifiableFrame>,
    )
    expect(screen.getByTestId('magnifiable-row-5')).toHaveAttribute('aria-pressed', 'false')

    rerender(
      <MagnifierProvider>
        <ToastProvider>
          <MagnifiableFrame id="row-5" onCommit={() => {}} label="A" selected>
            <span>row</span>
          </MagnifiableFrame>
        </ToastProvider>
      </MagnifierProvider>,
    )
    expect(screen.getByTestId('magnifiable-row-5')).toHaveAttribute('aria-pressed', 'true')

    rerender(
      <MagnifierProvider>
        <ToastProvider>
          <MagnifiableFrame id="row-5" onCommit={() => {}} label="A">
            <span>row</span>
          </MagnifiableFrame>
        </ToastProvider>
      </MagnifierProvider>,
    )
    expect(screen.getByTestId('magnifiable-row-5')).not.toHaveAttribute('aria-pressed')
  })
})

describe('one interactive node per control (no nested buttons)', () => {
  it('dock: the frame is the only role=button; the inner glyph is presentational', () => {
    inProvider(<DockSwitcher surface="phone" onSelect={() => {}} />)
    // The interactive node is the MagnifiableFrame.
    const frame = screen.getByTestId('magnifiable-dock-phone')
    expect(frame).toHaveAttribute('role', 'button')
    expect(frame).toHaveAttribute('tabindex', '0')
    // The inner glyph carries no interactive semantics.
    const glyph = screen.getByTestId('dock-phone')
    expect(glyph).not.toHaveAttribute('role')
    expect(glyph).not.toHaveAttribute('tabindex')
    // Exactly three dock buttons in the tree (one per surface), no nesting.
    const dockFrames = ['phone', 'music', 'maps'].map((s) =>
      screen.getByTestId(`magnifiable-dock-${s}`),
    )
    dockFrames.forEach((f) => expect(f).toHaveAttribute('role', 'button'))
  })

  it('tabs: each tab is one interactive frame; the label span is not a button', () => {
    inProvider(<TabPill tabs={['favorites', 'recents', 'contacts']} active="favorites" onChange={() => {}} />)
    const frame = screen.getByTestId('magnifiable-tab-favorites')
    expect(frame).toHaveAttribute('role', 'button')
    expect(frame).toHaveAttribute('tabindex', '0')
    // No descendant <button> remains inside the tab.
    expect(frame.querySelector('button')).toBeNull()
  })

  it('dock Enter fires onSelect for that surface', () => {
    const onSelect = vi.fn()
    inProvider(<DockSwitcher surface="phone" onSelect={onSelect} />)
    fireEvent.keyDown(screen.getByTestId('magnifiable-dock-maps'), { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('maps')
  })

  it('tab Enter fires onChange for that tab', () => {
    const onChange = vi.fn()
    inProvider(<TabPill tabs={['favorites', 'recents']} active="favorites" onChange={onChange} />)
    fireEvent.keyDown(screen.getByTestId('magnifiable-tab-recents'), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('recents')
  })
})
