import { describe, it, expect, vi } from 'vitest'
import { useRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { MagnifiableFrame } from './MagnifiableFrame'
import { useMagnifiable } from './useMagnifiable'
import { MasterOrb } from '../MasterOrb/MasterOrb'

describe('Magnifier integration', () => {
  it('commits the target under the lift, not just the only target, after drag from orb', () => {
    const onSarah = vi.fn()
    const onMom = vi.fn()
    render(
      <MagnifierProvider>
        <MasterOrb />
        <MagnifiableFrame id="mom" onCommit={onMom}>
          Mom
        </MagnifiableFrame>
        <MagnifiableFrame id="sarah" onCommit={onSarah}>
          Sarah
        </MagnifiableFrame>
      </MagnifierProvider>,
    )

    // jsdom does not lay out elements, so without stubbed rects the pick is
    // degenerate (every box is 0x0 at the origin) and a single target "passes"
    // regardless of geometry. Stub two separated boxes so the lift position
    // actually decides which target commits.
    const stubRect = (el: Element, top: number, left: number, w = 120, h = 56) => {
      el.getBoundingClientRect = () =>
        ({
          x: left,
          y: top,
          left,
          top,
          right: left + w,
          bottom: top + h,
          width: w,
          height: h,
          toJSON: () => ({}),
        }) as DOMRect
    }
    stubRect(screen.getByTestId('magnifiable-mom'), 20, 20)
    stubRect(screen.getByTestId('magnifiable-sarah'), 180, 260)

    const orbHit = screen.getByTestId('master-orb-hit')
    fireEvent.pointerDown(orbHit, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(orbHit, { pointerId: 1, clientX: 30, clientY: 10 })
    fireEvent.pointerMove(orbHit, { pointerId: 1, clientX: 300, clientY: 200 })
    fireEvent.pointerUp(orbHit, { pointerId: 1, clientX: 300, clientY: 200 })

    expect(onSarah).toHaveBeenCalledTimes(1)
    expect(onMom).not.toHaveBeenCalled()
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
