import { describe, it, expect, afterEach, vi } from 'vitest'
import { lockHaptic } from './haptics'

const original = Object.getOwnPropertyDescriptor(navigator, 'vibrate')

afterEach(() => {
  if (original) {
    Object.defineProperty(navigator, 'vibrate', original)
  } else {
    // @ts-expect-error cleanup of the test-injected property
    delete navigator.vibrate
  }
  vi.restoreAllMocks()
})

describe('lockHaptic', () => {
  it('fires a single 10ms pulse on a fresh lock when supported', () => {
    const vibrate = vi.fn().mockReturnValue(true)
    Object.defineProperty(navigator, 'vibrate', { configurable: true, writable: true, value: vibrate })
    const fired = lockHaptic(false)
    expect(fired).toBe(true)
    expect(vibrate).toHaveBeenCalledTimes(1)
    expect(vibrate).toHaveBeenCalledWith([10])
  })

  it('does not vibrate under reduced motion', () => {
    const vibrate = vi.fn().mockReturnValue(true)
    Object.defineProperty(navigator, 'vibrate', { configurable: true, writable: true, value: vibrate })
    const fired = lockHaptic(true)
    expect(fired).toBe(false)
    expect(vibrate).not.toHaveBeenCalled()
  })

  it('no-ops when the platform has no Vibration API', () => {
    Object.defineProperty(navigator, 'vibrate', { configurable: true, writable: true, value: undefined })
    expect(lockHaptic(false)).toBe(false)
  })

  it('swallows a throwing vibrate and reports no pulse', () => {
    const vibrate = vi.fn(() => {
      throw new Error('blocked by policy')
    })
    Object.defineProperty(navigator, 'vibrate', { configurable: true, writable: true, value: vibrate })
    expect(lockHaptic(false)).toBe(false)
  })
})
