import { useCallback, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { useSearchParams } from 'react-router-dom'
import moment from 'moment'
import { useSessionStorage } from 'usehooks-ts'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import rtlPlugin from 'stylis-plugin-rtl'
import 'moment/locale/he'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { PageSearchState, SearchContext } from '../model/pageState'
import { ThemeProvider } from '../layout/ThemeContext'
import { PAGES } from '../routes'
import { MainLayout } from '../layout'

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
})

export const MainRoute = () => {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const operatorId = searchParams.get('operatorId')
  const lineNumber = searchParams.get('lineNumber')
  const routeKey = searchParams.get('routeKey')
  const timestamp = searchParams.get('timestamp')

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search })
  }, [location])

  const [search, setSearch] = useSessionStorage<PageSearchState>('search', {
    timestamp: +timestamp! || moment().valueOf(),
    operatorId: operatorId || '',
    lineNumber: lineNumber || '',
    routeKey: routeKey || '',
  })

  useEffect(() => {
    const page = PAGES.find((page) => page.path === location.pathname)
    if (page && 'searchParamsRequired' in page && page.searchParamsRequired) {
      const params = new URLSearchParams({
        timestamp: search.timestamp?.toString(),
      })

      if (search.operatorId) {
        params.set('operatorId', search.operatorId)
      }
      if (search.lineNumber) {
        params.set('lineNumber', search.lineNumber)
      }
      if (search.routeKey) {
        params.set('routeKey', search.routeKey)
      }
      setSearchParams(params)
    }
  }, [
    search.lineNumber,
    search.operatorId,
    search.routeKey,
    search.timestamp,
    location.pathname,
    setSearchParams,
  ])

  const safeSetSearch = useCallback((mutate: (prevState: PageSearchState) => PageSearchState) => {
    setSearch((current: PageSearchState) => {
      const newSearch = mutate(current)
      return newSearch
    })
  }, [])

  return (
    <SearchContext.Provider value={{ search, setSearch: safeSetSearch }}>
      <CacheProvider value={cacheRtl}>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="he">
          <ThemeProvider>
            <MainLayout />
          </ThemeProvider>
        </LocalizationProvider>
      </CacheProvider>
    </SearchContext.Provider>
  )
}
