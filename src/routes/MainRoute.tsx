import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useCallback, useEffect } from 'react'
import ReactGA from 'react-ga4'
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
  const startTime = searchParams.get('startTime')
  const timestamp = searchParams.get('timestamp')

  useEffect(() => {
    try {
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search })
    } catch (e) {
      console.error('Failed to send Google Analytics', e)
    }
  }, [location])

  const [search, setSearch] = useSessionStorage<PageSearchState>('search', {
    timestamp: +timestamp! || dayjs().valueOf(),
    operatorId: operatorId || '',
    lineNumber: lineNumber || '',
    vehicleNumber: vehicleNumber ? Number(vehicleNumber) : undefined,
    routeKey: routeKey || '',
    startTime: startTime || '', // startTime ?? undefined,
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
      if (search.startTime) {
        params.set('startTime', search.startTime)
      }
      setSearchParams(params)
    }
  }, [
    search.lineNumber,
    search.vehicleNumber,
    search.operatorId,
    search.routeKey,
    search.startTime,
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
