import { describe, it, expect, vi } from 'vitest'
import { useRef } from 'react'
import { act, render, screen } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { useMagnifierDriver } from './useMagnifierDriver'
import { useMagnifiable } from './useMagnifiable'
import { useMagnifierContext } from './MagnifierContext'

describe('useMagnifierDriver.end idempotency', () => {
  it('does not double-fire onCommit when end() is called twice in a row', () => {
    const onCommit = vi.fn()

    function Driver({ onReady }: { onReady: (api: ReturnType<typeof useMagnifierDriver>) => void }) {
      const api = useMagnifierDriver()
      onReady(api)
      return null
    }

    function Target() {
      const ref = useRef<HTMLDivElement>(null)
      useMagnifiable({ id: 'thing', ref, behavior: 'snapToCenter', onCommit })
      return (
        <div
          ref={ref}
          data-testid="thing"
          style={{ position: 'absolute', top: 100, left: 100, width: 50, height: 50 }}
        />
      )
    }

    let driverApi: ReturnType<typeof useMagnifierDriver> | null = null
    render(
      <MagnifierProvider>
        <Driver onReady={(a) => { driverApi = a }} />
        <Target />
      </MagnifierProvider>,
    )

    // jsdom needs a stubbed rect for the target.
    const targetEl = screen.getByTestId('thing')
    targetEl.getBoundingClientRect = () =>
      ({
        x: 100, y: 100, left: 100, top: 100, right: 150, bottom: 150,
        width: 50, height: 50, toJSON: () => ({}),
      }) as DOMRect

    const api = driverApi!
    api.start()
    api.move({ x: 125, y: 125 })
    const idA = api.end({ x: 125, y: 125 })
    const idB = api.end({ x: 125, y: 125 })

    expect(idA).toBe('thing')
    expect(idB).toBe(null)
    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it('publishes gestureDirection from recent move samples', () => {
    function Driver({ onReady }: { onReady: (api: ReturnType<typeof useMagnifierDriver>) => void }) {
      const api = useMagnifierDriver()
      onReady(api)
      return null
    }

    function DirectionProbe() {
      const { gestureDirection } = useMagnifierContext()
      return <div data-testid="dir">{gestureDirection}</div>
    }

    let driverApi: ReturnType<typeof useMagnifierDriver> | null = null
    render(
      <MagnifierProvider>
        <Driver onReady={(a) => { driverApi = a }} />
        <DirectionProbe />
      </MagnifierProvider>,
    )

    expect(screen.getByTestId('dir').textContent).toBe('idle')

    const api = driverApi!
    act(() => { api.start() })
    // Vertical sweep: y moves much faster than x.
    act(() => {
      api.move({ x: 100, y: 100 })
      api.move({ x: 100, y: 130 })
      api.move({ x: 101, y: 160 })
      api.move({ x: 100, y: 190 })
      api.move({ x: 101, y: 220 })
    })
    expect(screen.getByTestId('dir').textContent).toBe('vertical')

    // Switch to a horizontal sweep; recent samples should re-classify.
    act(() => {
      api.move({ x: 120, y: 220 })
      api.move({ x: 150, y: 221 })
      api.move({ x: 180, y: 220 })
      api.move({ x: 210, y: 221 })
      api.move({ x: 240, y: 220 })
    })
    expect(screen.getByTestId('dir').textContent).toBe('horizontal')

    act(() => { api.end({ x: 240, y: 220 }) })
    expect(screen.getByTestId('dir').textContent).toBe('idle')
  })

  it('returns null and skips onCommit when end() is called without a prior start()', () => {
    const onCommit = vi.fn()

    function Driver({ onReady }: { onReady: (api: ReturnType<typeof useMagnifierDriver>) => void }) {
      const api = useMagnifierDriver()
      onReady(api)
      return null
    }

    function Target() {
      const ref = useRef<HTMLDivElement>(null)
      useMagnifiable({ id: 'orphan', ref, behavior: 'snapToCenter', onCommit })
      return <div ref={ref} data-testid="orphan" />
    }

    let driverApi: ReturnType<typeof useMagnifierDriver> | null = null
    render(
      <MagnifierProvider>
        <Driver onReady={(a) => { driverApi = a }} />
        <Target />
      </MagnifierProvider>,
    )

    const id = driverApi!.end({ x: 0, y: 0 })
    expect(id).toBe(null)
    expect(onCommit).not.toHaveBeenCalled()
  })
})

