import { describe, it, expect, vi } from 'vitest'
import { useRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { MagnifiableFrame } from './MagnifiableFrame'
import { useMagnifiable } from './useMagnifiable'
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
