import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import type { GTFS_API } from 'src/api/apiConfig'
import {
  GLOBAL_SEARCH_DEFAULTS,
  GlobalSearchContext,
  type GlobalSearchState,
} from 'src/model/globalState'
import OperatorSelector from './OperatorSelector'

const agenciesListGet = vi.hoisted(() => vi.fn<typeof GTFS_API.gtfsAgenciesListGet>())

vi.mock('src/api/apiConfig', () => ({
  GTFS_API: { gtfsAgenciesListGet: agenciesListGet },
}))

const agency = (
  date: string,
  operatorRef: number,
  agencyName: string,
): GtfsAgencyPydanticModel => ({
  date: new Date(`${date}T00:00:00Z`),
  operatorRef,
  agencyName,
})

const SHABBAT = '2026-08-29'
const WEEKDAY = '2026-08-30'

function Harness() {
  const [search, setSearch] = useState<GlobalSearchState>({
    ...GLOBAL_SEARCH_DEFAULTS,
    date: SHABBAT,
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSearchContext.Provider value={{ search, setSearch }}>
        <button
          data-testid="pick-weekday"
          onClick={() => setSearch((current) => ({ ...current, date: WEEKDAY }))}
        />
        <OperatorSelector operatorId="" setOperatorId={() => {}} />
      </GlobalSearchContext.Provider>
    </QueryClientProvider>
  )
}

const dateFromOf = (call: number) => {
  const request = agenciesListGet.mock.calls[call]?.[0]
  if (!request) throw new Error(`gtfsAgenciesListGet was called less than ${call + 1} times`)
  return request.dateFrom
}

beforeEach(() => {
  agenciesListGet.mockReset()
  agenciesListGet.mockImplementation((request) =>
    Promise.resolve(
      request?.dateFrom?.toISOString().startsWith(SHABBAT)
        ? [agency(SHABBAT, 3, 'אגד')]
        : [agency(WEEKDAY, 3, 'אגד'), agency(WEEKDAY, 15, 'מטרופולין')],
    ),
  )
})

it('lists the operators of the globally selected day', async () => {
  render(<Harness />)

  await waitFor(() => expect(agenciesListGet).toHaveBeenCalled())
  expect(dateFromOf(0)).toEqual(new Date(`${SHABBAT}T12:00:00Z`))

  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })
  expect(await screen.findByText('אגד')).toBeInTheDocument()
  expect(screen.queryByText('מטרופולין')).not.toBeInTheDocument()
})

// The bug this component had: the list was fetched once, relative to the real "now", so
// picking another day kept showing the operators of that first fetch.
it('refetches when the selected day changes', async () => {
  render(<Harness />)
  await waitFor(() => expect(agenciesListGet).toHaveBeenCalledTimes(1))

  fireEvent.click(screen.getByTestId('pick-weekday'))

  await waitFor(() => expect(agenciesListGet).toHaveBeenCalledTimes(2))
  expect(dateFromOf(1)).toEqual(new Date(`${WEEKDAY}T12:00:00Z`))

  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })
  expect(await screen.findByText('מטרופולין')).toBeInTheDocument()
})
