import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MagnifierProvider } from '../Magnifier'
import { DrivingProvider } from './DrivingContext'
import { RadialDialer } from './RadialDialer'

function renderDialer(driving = false) {
  return render(
    <MagnifierProvider>
      <DrivingProvider driving={driving}>
        <RadialDialer />
      </DrivingProvider>
    </MagnifierProvider>,
  )
}

describe('RadialDialer', () => {
  it('renders 10 digit buttons (0-9)', () => {
    renderDialer(false)
    for (let d = 0; d <= 9; d++) {
      expect(screen.getByTestId(`dialer-digit-${d}`)).toBeInTheDocument()
    }
  })

  it('shows readout starting empty', () => {
    renderDialer(false)
    expect(screen.getByTestId('dialer-readout').textContent).toBe('')
  })

  it('appends digit on tap', () => {
    renderDialer(false)
    fireEvent.click(screen.getByTestId('dialer-digit-5'))
    expect(screen.getByTestId('dialer-readout').textContent).toBe('5')
  })

  it('disables all digits while driving', () => {
    renderDialer(true)
    expect(screen.getByTestId('dialer-disabled-notice')).toBeInTheDocument()
    expect(screen.queryByTestId('dialer-digit-5')).not.toBeInTheDocument()
  })

  it('backspace removes the last digit', () => {
    renderDialer(false)
    fireEvent.click(screen.getByTestId('dialer-digit-5'))
    fireEvent.click(screen.getByTestId('dialer-digit-1'))
    expect(screen.getByTestId('dialer-readout').textContent).toBe('51')
    fireEvent.click(screen.getByTestId('dialer-backspace'))
    expect(screen.getByTestId('dialer-readout').textContent).toBe('5')
  })
})
