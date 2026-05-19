import { describe, it, expect } from 'vitest'
import { createActor } from 'xstate'
import { orbMachine } from './orbMachine'

describe('orbMachine', () => {
  it('starts in the idle state', () => {
    const actor = createActor(orbMachine).start()
    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('transitions idle -> siriActive on TAP', () => {
    const actor = createActor(orbMachine).start()
    actor.send({ type: 'TAP' })
    expect(actor.getSnapshot().value).toBe('siriActive')
  })

  it('transitions siriActive -> idle on TAP (cancel)', () => {
    const actor = createActor(orbMachine).start()
    actor.send({ type: 'TAP' })
    actor.send({ type: 'TAP' })
    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('transitions siriActive -> idle on SWIPE_DOWN', () => {
    const actor = createActor(orbMachine).start()
    actor.send({ type: 'TAP' })
    actor.send({ type: 'SWIPE_DOWN' })
    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('transitions idle -> rotary on DRAG_START', () => {
    const actor = createActor(orbMachine).start()
    actor.send({ type: 'DRAG_START' })
    expect(actor.getSnapshot().value).toBe('rotary')
  })

  it('transitions rotary -> idle on COMMIT', () => {
    const actor = createActor(orbMachine).start()
    actor.send({ type: 'DRAG_START' })
    actor.send({ type: 'COMMIT', targetId: 'sarah' })
    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('transitions rotary -> idle on ABORT', () => {
    const actor = createActor(orbMachine).start()
    actor.send({ type: 'DRAG_START' })
    actor.send({ type: 'ABORT' })
    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('records the last committed target in context', () => {
    const actor = createActor(orbMachine).start()
    actor.send({ type: 'DRAG_START' })
    actor.send({ type: 'COMMIT', targetId: 'sarah' })
    expect(actor.getSnapshot().context.lastCommitted).toBe('sarah')
  })

  it('ignores SWIPE_DOWN in idle (no transition)', () => {
    const actor = createActor(orbMachine).start()
    actor.send({ type: 'SWIPE_DOWN' })
    expect(actor.getSnapshot().value).toBe('idle')
  })
})
