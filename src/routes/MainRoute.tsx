import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactGA from 'react-ga4'
import { useLocation, useSearchParams } from 'react-router'
import rtlPlugin from 'stylis-plugin-rtl'
import { useSessionStorage } from 'usehooks-ts'
import dayjs from 'src/dayjs'
import { MainLayout } from '../layout'
import { ThemeProvider } from '../layout/ThemeContext'
import {
  ExtraShareParamsContext,
  InitialUrlParamsContext,
  PageSearchState,
  SearchContext,
} from '../model/pageState'

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
})

export const MainRoute = () => {
  const location = useLocation()
  const [, setSearchParams] = useSearchParams()

  useEffect(() => {
    try {
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search })
    } catch (e) {
      console.error('Failed to initialize Google Analytics', e)
    }
  }, [location])

  // Capture URL params synchronously on mount, before they are stripped.
  // useMemo with [] deps runs once and the value is stable — available to lazy-loaded
  // child pages via InitialUrlParamsContext even after the address bar is cleaned up.
  const initialUrlParams = useMemo<Record<string, string>>(() => {
    const result: Record<string, string> = {}
    new URLSearchParams(window.location.search).forEach((v, k) => {
      result[k] = v
    })
    return result
  }, [])

  // Parse the captured URL params into SearchContext fields
  const urlState = useMemo<Partial<PageSearchState>>(() => {
    const p = initialUrlParams
    return {
      ...(p.timestamp ? { timestamp: +p.timestamp } : {}),
      ...(p.operatorId ? { operatorId: p.operatorId } : {}),
      ...(p.lineNumber ? { lineNumber: p.lineNumber } : {}),
      ...(p.vehicleNumber ? { vehicleNumber: Number(p.vehicleNumber) } : {}),
      ...(p.routeKey ? { routeKey: p.routeKey } : {}),
      ...(p.startTime ? { startTime: p.startTime } : {}),
    }
  }, [])

  const [search, setSearch] = useSessionStorage<PageSearchState>('search', {
    timestamp: dayjs().valueOf(),
    operatorId: '',
    lineNumber: '',
    routeKey: '',
    startTime: '',
    ...urlState,
  })

  // If session storage already had values, urlState was ignored above — apply it now.
  // This ensures shared links always override stale session state.
  useEffect(() => {
    if (Object.keys(urlState).length > 0) {
      setSearch((current) => ({ ...current, ...urlState }))
    }
  }, [])

  // Strip URL params from the address bar after they've seeded state.
  // Params are only generated on-demand (Share button); they should never linger.
  const locationSearch = location.search
  useEffect(() => {
    if (locationSearch) {
      setSearchParams({}, { replace: true })
    }
  }, [locationSearch, setSearchParams])

  const [extraShareParams, setExtraShareParams] = useState<Record<string, string>>({})

  const safeSetSearch = useCallback((mutate: (prevState: PageSearchState) => PageSearchState) => {
    setSearch((current: PageSearchState) => mutate(current))
  }, [])

  const setExtraShareParamsStable = useCallback((params: Record<string, string>) => {
    setExtraShareParams(params)
  }, [])

  return (
    <InitialUrlParamsContext.Provider value={initialUrlParams}>
      <ExtraShareParamsContext.Provider
        value={{ params: extraShareParams, setParams: setExtraShareParamsStable }}>
        <SearchContext.Provider value={{ search, setSearch: safeSetSearch }}>
          <CacheProvider value={cacheRtl}>
            <ThemeProvider>
              <MainLayout />
            </ThemeProvider>
          </CacheProvider>
        </SearchContext.Provider>
      </ExtraShareParamsContext.Provider>
    </InitialUrlParamsContext.Provider>
  )
}
