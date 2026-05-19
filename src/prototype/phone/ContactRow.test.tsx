import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MagnifierProvider } from '../Magnifier'
import { ContactRow } from './ContactRow'

describe('ContactRow', () => {
  it('renders the name and avatar', () => {
    render(
      <MagnifierProvider>
        <ContactRow id="sarah" name="Sarah" avatar="S" onCall={() => {}} onText={() => {}} />
      </MagnifierProvider>,
    )
    expect(screen.getByText('Sarah')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('fires onCall when swiped right past threshold', () => {
    const onCall = vi.fn()
    render(
      <MagnifierProvider>
        <ContactRow id="sarah" name="Sarah" avatar="S" onCall={onCall} onText={() => {}} />
      </MagnifierProvider>,
    )
    const row = screen.getByTestId('contact-row-sarah')
    fireEvent.pointerDown(row, { pointerId: 1, clientX: 10, clientY: 50 })
    fireEvent.pointerMove(row, { pointerId: 1, clientX: 60, clientY: 50 })
    fireEvent.pointerUp(row, { pointerId: 1, clientX: 60, clientY: 50 })
    expect(onCall).toHaveBeenCalledTimes(1)
  })

  it('fires onText when swiped left past threshold', () => {
    const onText = vi.fn()
    render(
      <MagnifierProvider>
        <ContactRow id="sarah" name="Sarah" avatar="S" onCall={() => {}} onText={onText} />
      </MagnifierProvider>,
    )
    const row = screen.getByTestId('contact-row-sarah')
    fireEvent.pointerDown(row, { pointerId: 1, clientX: 80, clientY: 50 })
    fireEvent.pointerMove(row, { pointerId: 1, clientX: 30, clientY: 50 })
    fireEvent.pointerUp(row, { pointerId: 1, clientX: 30, clientY: 50 })
    expect(onText).toHaveBeenCalledTimes(1)
  })

  it('wraps the row in an ExpandableCell for the long-press path', () => {
    render(
      <MagnifierProvider>
        <ContactRow id="sarah" name="Sarah" avatar="S" onCall={() => {}} onText={() => {}} />
      </MagnifierProvider>,
    )
    const cell = screen.getByTestId('expandable-contact-row-sarah')
    expect(cell).toBeInTheDocument()
    expect(cell.getAttribute('data-variant')).toBe('row')
    expect(cell.getAttribute('data-expansion-axis')).toBe('vertical')
  })
})
