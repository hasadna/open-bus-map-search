import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactGA from 'react-ga4'
import { useLocation, useSearchParams } from 'react-router'
import rtlPlugin from 'stylis-plugin-rtl'
import { useSessionStorage } from 'usehooks-ts'

import { MainLayout } from '../layout'
import { ThemeProvider } from '../layout/ThemeContext'
import { GlobalSearchContext } from '../model/globalState'
import { InitialUrlParamsContext, PageShareParamsContext } from '../model/pageState'
import { GLOBAL_SEARCH_DEFAULTS, GlobalSearchState } from '../model/searchState'

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
})

export const MainRoute = () => {
  const { pathname, search: locationParams } = useLocation()
  const [, setSearchParams] = useSearchParams()

  useEffect(() => {
    try {
      ReactGA.send({ hitType: 'pageview', page: pathname + locationParams })
    } catch (e) {
      console.error('Failed to initialize Google Analytics', e)
    }
  }, [pathname, locationParams])

  // Capture URL params synchronously on mount, before they are stripped.
  // useMemo with [] deps runs once — available to lazy-loaded child pages via
  // InitialUrlParamsContext even after the address bar has been cleaned up.
  const initialUrlParams = useMemo<Record<string, string>>(() => {
    const result: Record<string, string> = {}
    new URLSearchParams(window.location.search).forEach((v, k) => {
      result[k] = v
    })
    return result
  }, [])

  const urlState = useMemo<Partial<GlobalSearchState>>(() => {
    const p = initialUrlParams
    const rideTime = p.rideTime ?? p.startTime ?? undefined
    return {
      ...(p.date ? { date: p.date } : {}),
      ...(p.operatorId ? { operatorId: p.operatorId } : {}),
      ...(p.lineNumber ? { lineNumber: p.lineNumber } : {}),
      ...(p.vehicleNumber ? { vehicleNumber: Number(p.vehicleNumber) } : {}),
      ...(p.routeKey ? { routeKey: p.routeKey } : {}),
      ...(rideTime ? { rideTime } : {}),
      ...(p.stopKey ? { stopKey: p.stopKey } : {}),
    }
  }, [])

  const [search, setSearch] = useSessionStorage<GlobalSearchState>('search', {
    ...GLOBAL_SEARCH_DEFAULTS,
    ...urlState,
  })

  // If session storage already had values, urlState was ignored above — apply
  // it now. Shared links must always override stale session state.
  useEffect(() => {
    if (Object.keys(urlState).length > 0) {
      setSearch((current) => ({ ...current, ...urlState }))
    }
  }, [])

  // Strip URL params from the address bar after they've seeded state.
  // Params are only generated on-demand (Share button); they should never linger.
  useEffect(() => {
    if (locationParams) {
      setSearchParams({}, { replace: true })
    }
  }, [locationParams, setSearchParams])

  const [extraShareParams, setExtraShareParams] = useState<Record<string, string>>({})

  const safeSetSearch = useCallback(
    (mutate: (prevState: GlobalSearchState) => GlobalSearchState) => {
      setSearch((current: GlobalSearchState) => mutate(current))
    },
    [],
  )

  const setExtraShareParamsStable = useCallback((params: Record<string, string>) => {
    setExtraShareParams(params)
  }, [])

  return (
    <InitialUrlParamsContext.Provider value={initialUrlParams}>
      <PageShareParamsContext.Provider
        value={{ params: extraShareParams, setParams: setExtraShareParamsStable }}>
        <GlobalSearchContext.Provider value={{ search, setSearch: safeSetSearch }}>
          <CacheProvider value={cacheRtl}>
            <ThemeProvider>
              <MainLayout />
            </ThemeProvider>
          </CacheProvider>
        </GlobalSearchContext.Provider>
      </PageShareParamsContext.Provider>
    </InitialUrlParamsContext.Provider>
  )
}
