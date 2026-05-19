import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MagnifierProvider, useMagnifierInternal } from '../prototype/Magnifier'
import { AriaLockAnnouncer } from './AriaLockAnnouncer'

function Harness() {
  const internal = useMagnifierInternal()
  return (
    <>
      <button data-testid="set-a" onClick={() => internal.setLockedId('contact-a')}>set a</button>
      <button data-testid="set-b" onClick={() => internal.setLockedId('contact-b')}>set b</button>
      <button data-testid="clear" onClick={() => internal.setLockedId(null)}>clear</button>
      <AriaLockAnnouncer
        labels={{ 'contact-a': 'Mom', 'contact-b': 'Dad' }}
      />
    </>
  )
}

describe('AriaLockAnnouncer', () => {
  it('announces the locked target label via aria-live region', () => {
    render(
      <MagnifierProvider>
        <Harness />
      </MagnifierProvider>,
    )
    const region = screen.getByRole('status', { hidden: true })
    expect(region.textContent).toBe('')
    act(() => { screen.getByTestId('set-a').click() })
    expect(region.textContent).toContain('Mom')
    act(() => { screen.getByTestId('set-b').click() })
    expect(region.textContent).toContain('Dad')
    act(() => { screen.getByTestId('clear').click() })
    expect(region.textContent).toBe('')
  })
})
