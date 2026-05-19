import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLongPressAnywhere } from './useLongPressAnywhere'

describe('useLongPressAnywhere', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  function dispatchPointer(type: string, x = 100, y = 100) {
    const evt = new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 1,
      clientX: x, clientY: y,
    })
    window.dispatchEvent(evt)
  }

  it('does not fire when enabled is false', () => {
    const onLongPress = vi.fn()
    renderHook(() => useLongPressAnywhere({ enabled: false, onLongPress }))
    dispatchPointer('pointerdown')
    vi.advanceTimersByTime(300)
    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('fires after the 250ms threshold if pointer has not released or moved', () => {
    const onLongPress = vi.fn()
    renderHook(() => useLongPressAnywhere({ enabled: true, onLongPress }))
    dispatchPointer('pointerdown', 100, 100)
    vi.advanceTimersByTime(260)
    expect(onLongPress).toHaveBeenCalledTimes(1)
    expect(onLongPress).toHaveBeenCalledWith({ x: 100, y: 100 })
  })

  it('does not fire if pointer releases before threshold', () => {
    const onLongPress = vi.fn()
    renderHook(() => useLongPressAnywhere({ enabled: true, onLongPress }))
    dispatchPointer('pointerdown')
    vi.advanceTimersByTime(150)
    dispatchPointer('pointerup')
    vi.advanceTimersByTime(200)
    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('does not fire if pointer moves more than 8px before threshold', () => {
    const onLongPress = vi.fn()
    renderHook(() => useLongPressAnywhere({ enabled: true, onLongPress }))
    dispatchPointer('pointerdown', 100, 100)
    vi.advanceTimersByTime(100)
    dispatchPointer('pointermove', 120, 100)
    vi.advanceTimersByTime(200)
    expect(onLongPress).not.toHaveBeenCalled()
  })
})
