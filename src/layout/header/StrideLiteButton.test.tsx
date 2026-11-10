import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { isStrideLiteSelected } from 'src/api/strideLite'
import { StrideLiteButton } from './StrideLiteButton'

afterEach(() => {
  vi.unstubAllEnvs()
  localStorage.clear()
})

const renderButton = (client = new QueryClient()) =>
  render(
    <QueryClientProvider client={client}>
      <StrideLiteButton />
    </QueryClientProvider>,
  )

describe('StrideLiteButton', () => {
  test('opts this browser in and out, forgetting what the other backend answered', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example')
    const client = new QueryClient()
    client.setQueryData(['gtfs_routes'], [{ id: 1 }])
    renderButton(client)

    fireEvent.click(screen.getByRole('button', { name: 'Use the experimental API' }))
    expect(isStrideLiteSelected()).toBe(true)
    expect(client.getQueryData(['gtfs_routes'])).toBeUndefined()

    fireEvent.click(screen.getByRole('button', { name: 'Stop using the experimental API' }))
    expect(isStrideLiteSelected()).toBe(false)
  })

  test('is absent when no experimental API is configured', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', '')
    renderButton()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
