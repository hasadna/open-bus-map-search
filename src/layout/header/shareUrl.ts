import { getPathWithoutLang } from 'src/locale/allTranslations'
import { GlobalSearchState } from 'src/model/globalState'

export type ShareableKey = keyof GlobalSearchState

// Only include params that are actually used on each page.
// Pages absent from this map (homepage, about, donate, etc.) get no params.
export const PAGE_SHARE_PARAMS: Partial<Record<string, ShareableKey[]>> = {
  '/timeline': ['date', 'operatorId', 'lineNumber', 'routeKey', 'stopKey'],
  '/gaps': ['date', 'operatorId', 'lineNumber', 'routeKey'],
  '/gaps_patterns': ['operatorId', 'lineNumber', 'routeKey'],
  '/map': [],
  '/velocity-heatmap': ['date'],
  '/single-line-map': ['date', 'operatorId', 'lineNumber', 'routeKey', 'rideTime'],
  // /vehicle shares the global date here; its page-local vehicleNumber is appended
  // via PageShareParamsContext (like gaps_patterns' start/end dates).
  '/vehicle': ['date'],
  '/operator': ['operatorId', 'date'],
}

/**
 * Build a shareable URL for the given page.
 *
 * Only the params relevant to that page are included (see PAGE_SHARE_PARAMS).
 * Page params (e.g. page-local state registered via PageShareParamsContext)
 * are appended last and override any GlobalSearchContext param with the same key.
 *
 * `basePath` is Vite's base (import.meta.env.BASE_URL): '/' in production, but a
 * deep sub-path like '/noam-gaash.co.il/<id>/open-bus/<n>/' for the S3-hosted PR
 * previews. The router mounts the app under that base and strips it from
 * location.pathname, so it must be re-added here — otherwise preview share links
 * drop the base and point at the S3 root (404).
 */
export const buildShareUrl = (
  pathname: string,
  search: GlobalSearchState,
  pageParams: Record<string, string>,
  origin = window.location.origin,
  basePath = '/',
): string => {
  const pagePath = getPathWithoutLang(pathname)
  const relevantKeys = PAGE_SHARE_PARAMS[pagePath] ?? []

  const params = new URLSearchParams()

  for (const key of relevantKeys) {
    const value = search[key]
    if (value) params.set(key, String(value))
  }

  Object.entries(pageParams).forEach(([key, value]) => params.set(key, value))

  const query = params.toString()
  // Drop any trailing slash so it joins cleanly with pagePath (which starts with
  // '/'); '/' → '' keeps production URLs unchanged.
  const base = basePath.replace(/\/+$/, '')
  // Use the lang-stripped path so shared links are language-agnostic.
  // The recipient's language preference (localStorage) picks their own lang.
  return `${origin}${base}${pagePath}${query ? `?${query}` : ''}`
}
