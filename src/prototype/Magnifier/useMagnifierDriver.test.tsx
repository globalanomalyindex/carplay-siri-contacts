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

  it('fires a quickdraw target the instant the lens locks on, before any lift', () => {
    const quickCommit = vi.fn()
    const plainCommit = vi.fn()

    function Driver({ onReady }: { onReady: (api: ReturnType<typeof useMagnifierDriver>) => void }) {
      const api = useMagnifierDriver()
      onReady(api)
      return null
    }

    function Targets() {
      const quickRef = useRef<HTMLDivElement>(null)
      const plainRef = useRef<HTMLDivElement>(null)
      useMagnifiable({ id: 'dock', ref: quickRef, behavior: 'snapToCenter', region: 'dock', quickdraw: true, onCommit: quickCommit })
      useMagnifiable({ id: 'row', ref: plainRef, behavior: 'snapToCenter', region: 'content', onCommit: plainCommit })
      return (
        <>
          <div ref={quickRef} data-testid="dock" />
          <div ref={plainRef} data-testid="row" />
        </>
      )
    }

    let driverApi: ReturnType<typeof useMagnifierDriver> | null = null
    render(
      <MagnifierProvider>
        <Driver onReady={(a) => { driverApi = a }} />
        <Targets />
      </MagnifierProvider>,
    )

    const stub = (el: HTMLElement, left: number, top: number) => {
      el.getBoundingClientRect = () =>
        ({
          x: left, y: top, left, top, right: left + 50, bottom: top + 50,
          width: 50, height: 50, toJSON: () => ({}),
        }) as DOMRect
    }
    // Realistic layout: the dock is the left rail, content sits to its right,
    // so region gating cleanly separates the two.
    stub(screen.getByTestId('dock'), 10, 100)
    stub(screen.getByTestId('row'), 240, 300)

    const api = driverApi!
    act(() => { api.start() })

    // Lens locks onto the dock target: quickdraw commits live, no lift yet.
    act(() => { api.move({ x: 35, y: 125 }) })
    expect(quickCommit).toHaveBeenCalledTimes(1)

    // Staying inside the same lock does not re-fire.
    act(() => { api.move({ x: 36, y: 126 }) })
    expect(quickCommit).toHaveBeenCalledTimes(1)

    // The plain content target never commits on hover, only on lift.
    act(() => { api.move({ x: 265, y: 325 }) })
    expect(plainCommit).not.toHaveBeenCalled()

    // Lifting over the plain target commits it once (the deliberate action).
    act(() => { api.end({ x: 265, y: 325 }) })
    expect(plainCommit).toHaveBeenCalledTimes(1)
  })

  it('opens the rested target menu after a dwell and tears down without committing', () => {
    vi.useFakeTimers()
    try {
      const onCommit = vi.fn()
      const seen = { menuId: null as string | null, rotary: false, locked: null as string | null }

      function Driver({ onReady }: { onReady: (api: ReturnType<typeof useMagnifierDriver>) => void }) {
        const api = useMagnifierDriver()
        onReady(api)
        return null
      }
      function Probe() {
        const { menuRequest, rotaryActive, lockedId } = useMagnifierContext()
        seen.menuId = menuRequest?.id ?? null
        seen.rotary = rotaryActive
        seen.locked = lockedId
        return null
      }
      function Target() {
        const ref = useRef<HTMLDivElement>(null)
        useMagnifiable({ id: 'row', ref, behavior: 'snapToCenter', region: 'content', onCommit })
        return <div ref={ref} data-testid="row" />
      }

      let api: ReturnType<typeof useMagnifierDriver> | null = null
      render(
        <MagnifierProvider>
          <Driver onReady={(a) => { api = a }} />
          <Probe />
          <Target />
        </MagnifierProvider>,
      )
      screen.getByTestId('row').getBoundingClientRect = () =>
        ({ x: 100, y: 100, left: 100, top: 100, right: 160, bottom: 150, width: 60, height: 50, toJSON: () => ({}) }) as DOMRect

      act(() => { api!.start() })
      act(() => { api!.move({ x: 130, y: 125 }) })
      expect(seen.locked).toBe('row')

      // Before the dwell elapses: no menu, still in rotary.
      act(() => { vi.advanceTimersByTime(900) })
      expect(seen.menuId).toBe(null)
      expect(seen.rotary).toBe(true)

      // Past the dwell: the row's menu is requested and the session is torn
      // down (lens off, not rotary) without ever committing the lock.
      act(() => { vi.advanceTimersByTime(200) })
      expect(seen.menuId).toBe('row')
      expect(seen.rotary).toBe(false)
      expect(seen.locked).toBe(null)
      expect(onCommit).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('restarts the dwell when the lens moves to a new target', () => {
    vi.useFakeTimers()
    try {
      const seen = { menuId: null as string | null }
      function Driver({ onReady }: { onReady: (api: ReturnType<typeof useMagnifierDriver>) => void }) {
        const api = useMagnifierDriver(); onReady(api); return null
      }
      function Probe() { seen.menuId = useMagnifierContext().menuRequest?.id ?? null; return null }
      function Targets() {
        const a = useRef<HTMLDivElement>(null)
        const b = useRef<HTMLDivElement>(null)
        useMagnifiable({ id: 'a', ref: a, behavior: 'snapToCenter', region: 'content', onCommit: () => {} })
        useMagnifiable({ id: 'b', ref: b, behavior: 'snapToCenter', region: 'content', onCommit: () => {} })
        return <><div ref={a} data-testid="a" /><div ref={b} data-testid="b" /></>
      }
      let api: ReturnType<typeof useMagnifierDriver> | null = null
      render(<MagnifierProvider><Driver onReady={(x) => { api = x }} /><Probe /><Targets /></MagnifierProvider>)
      screen.getByTestId('a').getBoundingClientRect = () => ({ x: 100, y: 100, left: 100, top: 100, right: 160, bottom: 150, width: 60, height: 50, toJSON: () => ({}) }) as DOMRect
      screen.getByTestId('b').getBoundingClientRect = () => ({ x: 100, y: 300, left: 100, top: 300, right: 160, bottom: 350, width: 60, height: 50, toJSON: () => ({}) }) as DOMRect

      act(() => { api!.start() })
      act(() => { api!.move({ x: 130, y: 125 }) })   // dwell on A begins
      act(() => { vi.advanceTimersByTime(700) })       // not yet
      act(() => { api!.move({ x: 130, y: 325 }) })   // moved to B: A's dwell is cancelled
      act(() => { vi.advanceTimersByTime(700) })       // 1400ms total, but only 700ms on B
      expect(seen.menuId).toBe(null)
      act(() => { vi.advanceTimersByTime(400) })       // B passes 1000ms
      expect(seen.menuId).toBe('b')
    } finally {
      vi.useRealTimers()
    }
  })

  it('never arms a dwell on a quickdraw target', () => {
    vi.useFakeTimers()
    try {
      const seen = { menuId: null as string | null }
      function Driver({ onReady }: { onReady: (api: ReturnType<typeof useMagnifierDriver>) => void }) {
        const api = useMagnifierDriver(); onReady(api); return null
      }
      function Probe() { seen.menuId = useMagnifierContext().menuRequest?.id ?? null; return null }
      function Target() {
        const ref = useRef<HTMLDivElement>(null)
        useMagnifiable({ id: 'dock', ref, behavior: 'snapToCenter', region: 'dock', quickdraw: true, onCommit: () => {} })
        return <div ref={ref} data-testid="dock" />
      }
      let api: ReturnType<typeof useMagnifierDriver> | null = null
      render(<MagnifierProvider><Driver onReady={(x) => { api = x }} /><Probe /><Target /></MagnifierProvider>)
      screen.getByTestId('dock').getBoundingClientRect = () => ({ x: 10, y: 100, left: 10, top: 100, right: 60, bottom: 150, width: 50, height: 50, toJSON: () => ({}) }) as DOMRect

      act(() => { api!.start() })
      act(() => { api!.move({ x: 35, y: 125 }) })
      act(() => { vi.advanceTimersByTime(1500) })
      expect(seen.menuId).toBe(null)
    } finally {
      vi.useRealTimers()
    }
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

