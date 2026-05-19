import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { MagnifiableFrame } from './MagnifiableFrame'

describe('MagnifiableFrame', () => {
  function renderInProvider(ui: React.ReactNode) {
    return render(<MagnifierProvider>{ui}</MagnifierProvider>)
  }

  it('renders children', () => {
    renderInProvider(
      <MagnifiableFrame id="x" onCommit={() => {}}>
        <span>row</span>
      </MagnifiableFrame>,
    )
    expect(screen.getByText('row')).toBeInTheDocument()
  })

  it('exposes data-testid via wrapping div for hit testing', () => {
    renderInProvider(
      <MagnifiableFrame id="row-1" onCommit={() => {}}>
        row 1
      </MagnifiableFrame>,
    )
    expect(screen.getByTestId('magnifiable-row-1')).toBeInTheDocument()
  })
})
