import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { MagnifiableFrame } from './MagnifiableFrame'
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
})
