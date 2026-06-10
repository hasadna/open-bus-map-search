import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactGAImport from 'react-ga4'
import { useLocation, useSearchParams } from 'react-router'
import { useSessionStorage } from 'usehooks-ts'
import { MainLayout } from '../layout'
import { ThemeProvider } from '../layout/ThemeContext'
import {
  GLOBAL_SEARCH_DEFAULTS,
  GlobalSearchContext,
  GlobalSearchState,
  isValidSearchDate,
} from '../model/globalState'
import { ExtraShareParamsContext, InitialUrlParamsContext } from '../model/routeContext'

// react-ga4's default export is nested under `.default` under some CJS/ESM interop
// (e.g. Vite/Rolldown), so unwrap it to keep the shared singleton.
const ReactGA =
  (ReactGAImport as unknown as { default?: typeof ReactGAImport }).default ?? ReactGAImport

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
  // useMemo with [] deps runs once and the value is stable — available to lazy-loaded
  // child pages via InitialUrlParamsContext even after the address bar is cleaned up.
  const initialUrlParams = useMemo<Record<string, string>>(() => {
    const result: Record<string, string> = {}
    new URLSearchParams(window.location.search).forEach((v, k) => {
      result[k] = v
    })
    return result
  }, [])

  // Parse the captured URL params into GlobalSearchContext fields
  const urlState = useMemo<Partial<GlobalSearchState>>(() => {
    const p = initialUrlParams
    // Accept 'rideTime' (new) or 'startTime' (old shared links) for backward compat
    const rideTime = p.rideTime ?? p.startTime ?? undefined
    return {
      ...(isValidSearchDate(p.date) ? { date: p.date } : {}),
      ...(p.operatorId ? { operatorId: p.operatorId } : {}),
      ...(p.lineNumber ? { lineNumber: p.lineNumber } : {}),
      ...(p.vehicleNumber ? { vehicleNumber: Number(p.vehicleNumber) } : {}),
      ...(p.routeKey ? { routeKey: p.routeKey } : {}),
      ...(rideTime ? { rideTime } : {}),
      ...(p.stopKey ? { stopKey: p.stopKey } : {}),
    }
  }, [])

  // 'search_v2' avoids type collisions with old 'search' session storage (which used timestamp)
  const [storedSearch, setSearch] = useSessionStorage<GlobalSearchState>('search_v2', {
    ...GLOBAL_SEARCH_DEFAULTS,
    ...urlState,
  })

  // A stored date that no longer parses (stale format, manual edit) falls back
  // to the default day instead of propagating an invalid date to every page.
  const search = useMemo<GlobalSearchState>(
    () =>
      isValidSearchDate(storedSearch.date)
        ? storedSearch
        : { ...storedSearch, date: GLOBAL_SEARCH_DEFAULTS.date },
    [storedSearch],
  )

  // If session storage already had values, urlState was ignored above — apply it now.
  // This ensures shared links always override stale session state.
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
      <ExtraShareParamsContext.Provider
        value={{ params: extraShareParams, setParams: setExtraShareParamsStable }}>
        <GlobalSearchContext.Provider value={{ search, setSearch: safeSetSearch }}>
          <ThemeProvider>
            <MainLayout />
          </ThemeProvider>
        </GlobalSearchContext.Provider>
      </ExtraShareParamsContext.Provider>
    </InitialUrlParamsContext.Provider>
  )
}
