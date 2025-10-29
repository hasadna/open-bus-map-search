import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useCallback, useEffect } from 'react'
import ReactGA from 'react-ga4'
import { GA4 } from 'react-ga4/types/ga4'
import { useLocation, useSearchParams } from 'react-router'
import rtlPlugin from 'stylis-plugin-rtl'
import { useSessionStorage } from 'usehooks-ts'
import dayjs from 'src/dayjs'
import { MainLayout } from '../layout'
import { ThemeProvider } from '../layout/ThemeContext'
import { PageSearchState, SearchContext } from '../model/pageState'
import { PAGES } from '../routes'
import 'leaflet/dist/leaflet.css'

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
  const vehicleNumber = searchParams.get('vehicleNumber')
  const routeKey = searchParams.get('routeKey')
  const timestamp = searchParams.get('timestamp')

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;((ReactGA as any).default as GA4).send({
      hitType: 'pageview',
      page: location.pathname + location.search,
    })
  }, [location])

  const [search, setSearch] = useSessionStorage<PageSearchState>('search', {
    timestamp: +timestamp! || dayjs().valueOf(),
    operatorId: operatorId || '',
    lineNumber: lineNumber || '',
    vehicleNumber: vehicleNumber ? Number(vehicleNumber) : undefined,
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
      if (search.vehicleNumber) {
        params.set('vehicleNumber', search.vehicleNumber.toString())
      }
      if (search.routeKey) {
        params.set('routeKey', search.routeKey)
      }
      setSearchParams(params)
    }
  }, [
    search.lineNumber,
    search.vehicleNumber,
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
        <ThemeProvider>
          <MainLayout />
        </ThemeProvider>
      </CacheProvider>
    </SearchContext.Provider>
  )
}
