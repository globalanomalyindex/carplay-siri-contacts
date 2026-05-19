import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MagnifierProvider } from '../Magnifier'
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
