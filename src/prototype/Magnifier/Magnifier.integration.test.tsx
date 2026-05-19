import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCallback, useRef, useState } from 'react'
import { act, render, screen, fireEvent } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { MagnifiableFrame } from './MagnifiableFrame'
import { useMagnifiable } from './useMagnifiable'
import { useMagnifierInternal, useMagnifierContext, findQuickActionsTargetAtPoint } from './MagnifierContext'
import { useLongPressAnywhere } from './useLongPressAnywhere'
import { useMagnifierDriver } from './useMagnifierDriver'
import { QuickActions } from './QuickActions'
import type { MagnifiableTarget, QuickAction } from './types'
import { MasterOrb } from '../MasterOrb/MasterOrb'

describe('Magnifier integration', () => {
  it('commits the locked target on lift after drag from orb', () => {
    const onSarah = vi.fn()
    render(
      <MagnifierProvider>
        <MasterOrb />
        <div style={{ position: 'absolute', top: 200, left: 300 }}>
          <MagnifiableFrame id="sarah" onCommit={onSarah}>
            Sarah
          </MagnifiableFrame>
        </div>
      </MagnifierProvider>,
    )

    const orbHit = screen.getByTestId('master-orb-hit')

    fireEvent.pointerDown(orbHit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(orbHit, { pointerId: 1, clientX: 30, clientY: 10 })
    fireEvent.pointerMove(orbHit, { pointerId: 1, clientX: 300, clientY: 200 })
    fireEvent.pointerUp(orbHit, { pointerId: 1, clientX: 300, clientY: 200 })

    expect(onSarah).toHaveBeenCalledTimes(1)
  })

  it('commits a freeDrift target on lift over its bounds', () => {
    const onMapTap = vi.fn()

    function MapStub() {
      const ref = useRef<HTMLDivElement>(null)
      useMagnifiable({ id: 'map', ref, behavior: 'freeDrift', onCommit: onMapTap })
      return (
        <div
          ref={ref}
          data-testid="map"
          style={{ position: 'absolute', top: 100, left: 100, width: 400, height: 200 }}
        />
      )
    }

    render(
      <MagnifierProvider>
        <MasterOrb />
        <MapStub />
      </MagnifierProvider>,
    )

    // jsdom does not lay out elements; stub the rect for the map element.
    const mapEl = screen.getByTestId('map')
    mapEl.getBoundingClientRect = () =>
      ({
        x: 100,
        y: 100,
        left: 100,
        top: 100,
        right: 500,
        bottom: 300,
        width: 400,
        height: 200,
        toJSON: () => ({}),
      }) as DOMRect

    const orbHit = screen.getByTestId('master-orb-hit')
    fireEvent.pointerDown(orbHit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(orbHit, { pointerId: 1, clientX: 30, clientY: 10 })
    fireEvent.pointerMove(orbHit, { pointerId: 1, clientX: 250, clientY: 150 })
    fireEvent.pointerUp(orbHit, { pointerId: 1, clientX: 250, clientY: 150 })

    expect(onMapTap).toHaveBeenCalledTimes(1)
    expect(onMapTap).toHaveBeenCalledWith({ x: 250, y: 150 })
  })
})

/**
 * Mirrors the App's ShellWiring decision so the integration assertion is
 * about the wiring, not about React internals.
 */
function ShellTriage() {
  const driver = useMagnifierDriver()
  const { getTargets } = useMagnifierInternal()
  const [menu, setMenu] = useState<{
    target: MagnifiableTarget
    anchor: { x: number; y: number }
  } | null>(null)

  const onLongPress = useCallback(
    (p: { x: number; y: number }) => {
      const target = findQuickActionsTargetAtPoint(getTargets(), p)
      if (target) setMenu({ target, anchor: p })
      else driver.start()
    },
    [driver, getTargets],
  )

  useLongPressAnywhere({ enabled: !menu, onLongPress })

  return menu ? (
    <QuickActions
      anchor={menu.anchor}
      actions={menu.target.quickActions!}
      onClose={() => setMenu(null)}
    />
  ) : null
}

function ProbeRotary({ onSnapshot }: { onSnapshot: (active: boolean) => void }) {
  const { rotaryActive } = useMagnifierContext()
  onSnapshot(rotaryActive)
  return null
}

const placeholderActions: QuickAction[] = [
  { id: 'call', label: 'Call', position: 'up', icon: <span>C</span>, onAction: () => {} },
  { id: 'text', label: 'Text', position: 'down', icon: <span>T</span>, onAction: () => {} },
]

describe('long-press triage: quick actions vs rotary', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('opens QuickActions when long-press fires over a target with quickActions', () => {
    let rotaryActive = false

    render(
      <MagnifierProvider>
        <ShellTriage />
        <ProbeRotary onSnapshot={(r) => { rotaryActive = r }} />
        <div style={{ position: 'absolute', top: 200, left: 300 }}>
          <MagnifiableFrame
            id="contact-row-sarah"
            onCommit={() => {}}
            quickActions={placeholderActions}
          >
            Sarah
          </MagnifiableFrame>
        </div>
      </MagnifierProvider>,
    )

    // jsdom does not lay out; stub the rect for the row so the point is inside.
    const rowEl = screen.getByTestId('magnifiable-contact-row-sarah')
    rowEl.getBoundingClientRect = () =>
      ({
        x: 300, y: 200, left: 300, top: 200, right: 500, bottom: 240,
        width: 200, height: 40, toJSON: () => ({}),
      }) as DOMRect

    // Long-press inside the row.
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerdown', {
        clientX: 350, clientY: 220, pointerId: 1,
      }))
    })
    act(() => { vi.advanceTimersByTime(300) })

    expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
    expect(rotaryActive).toBe(false)
  })

  it('starts rotary mode when long-press fires outside any quickActions target', () => {
    let rotaryActive = false

    render(
      <MagnifierProvider>
        <ShellTriage />
        <ProbeRotary onSnapshot={(r) => { rotaryActive = r }} />
      </MagnifierProvider>,
    )

    act(() => {
      window.dispatchEvent(new PointerEvent('pointerdown', {
        clientX: 10, clientY: 10, pointerId: 1,
      }))
    })
    act(() => { vi.advanceTimersByTime(300) })

    expect(screen.queryByTestId('quick-actions')).not.toBeInTheDocument()
    expect(rotaryActive).toBe(true)
  })
})
