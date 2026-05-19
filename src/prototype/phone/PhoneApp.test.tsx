import { describe, it, expect } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MagnifierProvider, useMagnifierInternal } from '../Magnifier'
import { DrivingProvider } from './DrivingContext'
import { PhoneApp } from './PhoneApp'

describe('PhoneApp', () => {
  function renderApp(driving: boolean) {
    return render(
      <MagnifierProvider>
        <DrivingProvider driving={driving}>
          <PhoneApp />
        </DrivingProvider>
      </MagnifierProvider>,
    )
  }

  it('shows all 3 tabs when parked', () => {
    renderApp(false)
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Recents')).toBeInTheDocument()
    expect(screen.getByText('Contacts')).toBeInTheDocument()
  })

  it('omits the Contacts tab silently when driving', () => {
    renderApp(true)
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Recents')).toBeInTheDocument()
    expect(screen.queryByText('Contacts')).not.toBeInTheDocument()
  })

  it('renders no "limited access" notice while driving', () => {
    renderApp(true)
    expect(screen.queryByText(/limited/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ask siri/i)).not.toBeInTheDocument()
  })
})

describe('PhoneApp pass-through tab open', () => {
  // Internal handle to setLockedId. Bypasses geometry so the test focuses
  // on the React reaction in PhoneApp without depending on jsdom rects.
  function LockController({ onReady }: { onReady: (set: (id: string | null) => void) => void }) {
    const api = useMagnifierInternal()
    onReady(api.setLockedId)
    return null
  }

  it('previews the Recents tab when the magnifier locks on tab-recents', () => {
    let setLock: ((id: string | null) => void) | null = null
    render(
      <MagnifierProvider>
        <LockController onReady={(fn) => { setLock = fn }} />
        <DrivingProvider driving={false}>
          <PhoneApp />
        </DrivingProvider>
      </MagnifierProvider>,
    )

    // Sanity: starts on Favorites, Recents not rendered yet.
    expect(screen.getByTestId('favorites-list')).toBeInTheDocument()
    expect(screen.queryByTestId('recents-list')).not.toBeInTheDocument()

    // Simulate the rotary picking up tab-recents.
    act(() => { setLock!('tab-recents') })

    expect(screen.getByTestId('recents-list')).toBeInTheDocument()
    expect(screen.queryByTestId('favorites-list')).not.toBeInTheDocument()
  })

  it('previews the Contacts tab when not driving', () => {
    let setLock: ((id: string | null) => void) | null = null
    render(
      <MagnifierProvider>
        <LockController onReady={(fn) => { setLock = fn }} />
        <DrivingProvider driving={false}>
          <PhoneApp />
        </DrivingProvider>
      </MagnifierProvider>,
    )

    act(() => { setLock!('tab-contacts') })
    expect(screen.getByTestId('contacts-list')).toBeInTheDocument()
  })

  it('ignores tab-contacts locks while driving (Contacts tab is hidden)', () => {
    let setLock: ((id: string | null) => void) | null = null
    render(
      <MagnifierProvider>
        <LockController onReady={(fn) => { setLock = fn }} />
        <DrivingProvider driving={true}>
          <PhoneApp />
        </DrivingProvider>
      </MagnifierProvider>,
    )

    // Driving omits Contacts entirely. Locking tab-contacts must not throw
    // or render a hidden tab.
    act(() => { setLock!('tab-contacts') })
    expect(screen.queryByTestId('contacts-list')).not.toBeInTheDocument()
    expect(screen.getByTestId('favorites-list')).toBeInTheDocument()
  })

  it('ignores non-tab locks (e.g. a contact row)', () => {
    let setLock: ((id: string | null) => void) | null = null
    render(
      <MagnifierProvider>
        <LockController onReady={(fn) => { setLock = fn }} />
        <DrivingProvider driving={false}>
          <PhoneApp />
        </DrivingProvider>
      </MagnifierProvider>,
    )

    // Lock onto a contact row, NOT a tab. PhoneApp should stay on
    // Favorites (its initial tab).
    act(() => { setLock!('contact-row-mom') })
    expect(screen.getByTestId('favorites-list')).toBeInTheDocument()
    expect(screen.queryByTestId('recents-list')).not.toBeInTheDocument()
  })
})
