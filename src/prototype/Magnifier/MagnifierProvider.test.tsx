import { describe, it, expect } from 'vitest'
import { render, renderHook } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { useMagnifierContext } from './MagnifierContext'
import { useMagnifiable } from './useMagnifiable'
import { useRef } from 'react'

describe('MagnifierProvider', () => {
  it('provides context with default values', () => {
    const { result } = renderHook(() => useMagnifierContext(), {
      wrapper: MagnifierProvider,
    })
    expect(result.current.lockedId).toBe(null)
    expect(result.current.rotaryActive).toBe(false)
  })

  it('throws when useMagnifierContext is used outside a provider', () => {
    expect(() => renderHook(() => useMagnifierContext())).toThrow(
      /MagnifierProvider/,
    )
  })

  it('allows components to register via useMagnifiable', () => {
    function TestComponent() {
      const ref = useRef<HTMLDivElement>(null)
      useMagnifiable({
        id: 'test-target',
        ref,
        behavior: 'snapToCenter',
        onCommit: () => {},
      })
      return <div ref={ref}>target</div>
    }

    render(
      <MagnifierProvider>
        <TestComponent />
      </MagnifierProvider>,
    )
  })
})
