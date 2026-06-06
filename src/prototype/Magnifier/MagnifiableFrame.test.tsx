import { describe, it, expect } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MagnifierProvider } from './MagnifierProvider'
import { useMagnifierInternal } from './MagnifierContext'
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

  it('emits data-region so the lens can strengthen content-row locks', () => {
    renderInProvider(
      <>
        <MagnifiableFrame id="row-r" onCommit={() => {}}>
          row
        </MagnifiableFrame>
        <MagnifiableFrame id="dock-r" region="dock" onCommit={() => {}}>
          dock
        </MagnifiableFrame>
      </>,
    )
    // Default region is content (the primary call target the lens emphasises).
    expect(screen.getByTestId('magnifiable-row-r')).toHaveAttribute('data-region', 'content')
    expect(screen.getByTestId('magnifiable-dock-r')).toHaveAttribute('data-region', 'dock')
  })

  it('renders a commit-flash overlay when recordCommit fires for its id', () => {
    let recordCommit: ((id: string) => void) | null = null
    function Probe() {
      const api = useMagnifierInternal()
      recordCommit = api.recordCommit
      return null
    }
    render(
      <MagnifierProvider>
        <Probe />
        <MagnifiableFrame id="row-flash" onCommit={() => {}}>
          row
        </MagnifiableFrame>
      </MagnifierProvider>,
    )

    // No flash overlay until a commit lands on this id.
    expect(screen.queryByTestId('commit-flash-row-flash')).not.toBeInTheDocument()

    act(() => { recordCommit!('row-flash') })

    expect(screen.getByTestId('commit-flash-row-flash')).toBeInTheDocument()
    expect(screen.getByTestId('magnifiable-row-flash')).toHaveAttribute('data-flashing', 'true')
  })

  it('does not render the flash overlay for other ids', () => {
    let recordCommit: ((id: string) => void) | null = null
    function Probe() {
      const api = useMagnifierInternal()
      recordCommit = api.recordCommit
      return null
    }
    render(
      <MagnifierProvider>
        <Probe />
        <MagnifiableFrame id="row-a" onCommit={() => {}}>
          a
        </MagnifiableFrame>
        <MagnifiableFrame id="row-b" onCommit={() => {}}>
          b
        </MagnifiableFrame>
      </MagnifierProvider>,
    )

    act(() => { recordCommit!('row-a') })

    expect(screen.getByTestId('commit-flash-row-a')).toBeInTheDocument()
    expect(screen.queryByTestId('commit-flash-row-b')).not.toBeInTheDocument()
  })
})
