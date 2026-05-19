import { describe, it, expect } from 'vitest'
import { findQuickActionsTargetAtPoint } from './MagnifierContext'
import type { MagnifiableTarget, QuickAction } from './types'

function fakeTarget(
  id: string,
  rect: { x: number; y: number; w: number; h: number },
  quickActions?: QuickAction[],
): MagnifiableTarget {
  const r: DOMRect = {
    x: rect.x, y: rect.y, width: rect.w, height: rect.h,
    top: rect.y, left: rect.x, right: rect.x + rect.w, bottom: rect.y + rect.h,
    toJSON: () => ({}),
  } as DOMRect

  const el = { getBoundingClientRect: () => r } as unknown as HTMLElement
  return {
    id,
    ref: { current: el },
    behavior: 'snapToCenter',
    onCommit: () => {},
    quickActions,
  }
}

const placeholderActions: QuickAction[] = [
  { id: 'a', label: 'A', position: 'up', icon: null, onAction: () => {} },
]

describe('findQuickActionsTargetAtPoint', () => {
  it('returns null when no target carries quickActions', () => {
    const targets = new Map<string, MagnifiableTarget>([
      ['a', fakeTarget('a', { x: 0, y: 0, w: 100, h: 100 })],
    ])
    expect(findQuickActionsTargetAtPoint(targets, { x: 50, y: 50 })).toBe(null)
  })

  it('returns the target whose rect contains the point and has quickActions', () => {
    const targets = new Map<string, MagnifiableTarget>([
      ['a', fakeTarget('a', { x: 0, y: 0, w: 100, h: 100 }, placeholderActions)],
      ['b', fakeTarget('b', { x: 200, y: 200, w: 100, h: 100 })],
    ])
    const hit = findQuickActionsTargetAtPoint(targets, { x: 50, y: 50 })
    expect(hit?.id).toBe('a')
  })

  it('skips targets without quickActions even if they contain the point', () => {
    const targets = new Map<string, MagnifiableTarget>([
      ['big', fakeTarget('big', { x: 0, y: 0, w: 400, h: 400 })],
      ['small', fakeTarget('small', { x: 100, y: 100, w: 50, h: 50 }, placeholderActions)],
    ])
    // Inside both rects; only `small` opts in.
    expect(findQuickActionsTargetAtPoint(targets, { x: 120, y: 120 })?.id).toBe('small')
    // Inside `big` only.
    expect(findQuickActionsTargetAtPoint(targets, { x: 20, y: 20 })).toBe(null)
  })

  it('prefers the smallest containing rect when nested', () => {
    const targets = new Map<string, MagnifiableTarget>([
      ['outer', fakeTarget('outer', { x: 0,   y: 0,   w: 400, h: 400 }, placeholderActions)],
      ['inner', fakeTarget('inner', { x: 100, y: 100, w: 100, h: 100 }, placeholderActions)],
    ])
    expect(findQuickActionsTargetAtPoint(targets, { x: 150, y: 150 })?.id).toBe('inner')
  })
})
