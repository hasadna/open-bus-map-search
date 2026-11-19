import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { setStrideLiteOptedIn } from 'src/api/strideLite'
import Menu from './Menu'

afterEach(() => {
  vi.unstubAllEnvs()
  localStorage.clear()
})

const renderMenu = () =>
  render(
    <MemoryRouter>
      <Menu />
    </MemoryRouter>,
  )

describe('Menu', () => {
  test('links to the experimental API stats only while the experimental API is in use', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example')
    renderMenu()
    expect(screen.queryByRole('link', { name: 'Experimental API stats' })).not.toBeInTheDocument()

    setStrideLiteOptedIn(true)
    renderMenu()
    expect(screen.getByRole('link', { name: 'Experimental API stats' })).toHaveAttribute(
      'href',
      '/stride-lite-status',
    )
  })
})
