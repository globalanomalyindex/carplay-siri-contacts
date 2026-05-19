import { describe, it, expect, vi } from 'vitest'
import { useRef } from 'react'
import { render, screen } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { useMagnifierDriver } from './useMagnifierDriver'
import { useMagnifiable } from './useMagnifiable'

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

