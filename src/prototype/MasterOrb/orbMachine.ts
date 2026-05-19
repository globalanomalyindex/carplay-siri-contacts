import { assign, setup } from 'xstate'

export interface OrbContext {
  /** ID of the last component committed via rotary mode (for testing/debug). */
  lastCommitted: string | null
}

export type OrbEvent =
  | { type: 'TAP' }
  | { type: 'SWIPE_DOWN' }
  | { type: 'DRAG_START' }
  | { type: 'LONG_PRESS_ANYWHERE' }
  | { type: 'COMMIT'; targetId: string }
  | { type: 'ABORT' }

/**
 * Orb state machine.
 *
 * idle ->TAP-> siriActive ->TAP / SWIPE_DOWN-> idle
 * idle ->DRAG_START-> rotary ->COMMIT / ABORT-> idle
 * idle ->LONG_PRESS_ANYWHERE-> rotary ->COMMIT / ABORT-> idle
 */
export const orbMachine = setup({
  types: {
    context: {} as OrbContext,
    events: {} as OrbEvent,
  },
  actions: {
    recordCommit: assign(({ event }) => {
      if (event.type !== 'COMMIT') return {}
      return { lastCommitted: event.targetId }
    }),
  },
}).createMachine({
  id: 'orb',
  initial: 'idle',
  context: { lastCommitted: null },
  states: {
    idle: {
      on: {
        TAP: 'siriActive',
        DRAG_START: 'rotary',
        LONG_PRESS_ANYWHERE: 'rotary',
      },
    },
    siriActive: {
      on: {
        TAP: 'idle',
        SWIPE_DOWN: 'idle',
        ABORT: 'idle',
      },
    },
    rotary: {
      on: {
        COMMIT: { target: 'idle', actions: 'recordCommit' },
        ABORT: 'idle',
      },
    },
  },
})

export type OrbState = 'idle' | 'siriActive' | 'rotary'
