import { describe, it, expect, beforeEach } from 'vitest'
import { hasPlayedCoach, markCoachPlayed, resetCoachGate } from './coachGate'

describe('coachGate', () => {
  beforeEach(() => {
    resetCoachGate()
  })

  it('reports not played before the first mark', () => {
    expect(hasPlayedCoach()).toBe(false)
  })

  it('reports played once marked, and stays played', () => {
    markCoachPlayed()
    expect(hasPlayedCoach()).toBe(true)
    // Idempotent: a second mark keeps it played.
    markCoachPlayed()
    expect(hasPlayedCoach()).toBe(true)
  })

  it('persists the played state in sessionStorage for soft route changes', () => {
    markCoachPlayed()
    expect(sessionStorage.getItem('carplay.coachPlayed')).toBe('1')
  })

  it('reset clears both the flag and sessionStorage (test-only)', () => {
    markCoachPlayed()
    resetCoachGate()
    expect(hasPlayedCoach()).toBe(false)
    expect(sessionStorage.getItem('carplay.coachPlayed')).toBeNull()
  })

  it('reads an existing sessionStorage flag set by a prior document', () => {
    resetCoachGate()
    sessionStorage.setItem('carplay.coachPlayed', '1')
    expect(hasPlayedCoach()).toBe(true)
  })
})
