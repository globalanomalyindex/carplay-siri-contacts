import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MagnifierProvider } from '../Magnifier'
import { TabPill } from './TabPill'

function renderPill(tabs: ('favorites' | 'recents' | 'contacts')[], onChange = vi.fn()) {
  const utils = render(
    <MagnifierProvider>
      <TabPill tabs={tabs} active={tabs[0]} onChange={onChange} />
    </MagnifierProvider>,
  )
  return { ...utils, onChange }
}

describe('TabPill', () => {
  it('renders each tab label', () => {
    renderPill(['favorites', 'recents'])
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Recents')).toBeInTheDocument()
  })

  it('advances active tab on horizontal swipe-right', () => {
    const { container, onChange } = renderPill(['favorites', 'recents'])
    const pill = container.querySelector('[data-testid="tab-pill"]')!
    fireEvent.pointerDown(pill, { pointerId: 1, clientX: 100, clientY: 10 })
    fireEvent.pointerMove(pill, { pointerId: 1, clientX: 30, clientY: 10 })
    fireEvent.pointerUp(pill, { pointerId: 1, clientX: 30, clientY: 10 })
    expect(onChange).toHaveBeenCalledWith('recents')
  })

  it('retreats on horizontal swipe-left', () => {
    const onChange = vi.fn()
    const { container } = render(
      <MagnifierProvider>
        <TabPill tabs={['favorites', 'recents']} active="recents" onChange={onChange} />
      </MagnifierProvider>,
    )
    const pill = container.querySelector('[data-testid="tab-pill"]')!
    fireEvent.pointerDown(pill, { pointerId: 1, clientX: 30, clientY: 10 })
    fireEvent.pointerMove(pill, { pointerId: 1, clientX: 100, clientY: 10 })
    fireEvent.pointerUp(pill, { pointerId: 1, clientX: 100, clientY: 10 })
    expect(onChange).toHaveBeenCalledWith('favorites')
  })
})
