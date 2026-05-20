import { getPathWithoutLang } from 'src/locale/allTranslations'
import { PageSearchState } from 'src/model/pageState'

export type ShareableKey = Exclude<keyof PageSearchState, 'routes'>

// Only include params that are actually used on each page.
// Pages absent from this map (homepage, about, donate, etc.) get no params.
export const PAGE_SHARE_PARAMS: Partial<Record<string, ShareableKey[]>> = {
  '/timeline': ['timestamp', 'operatorId', 'lineNumber', 'vehicleNumber', 'routeKey', 'startTime'],
  '/gaps': ['timestamp', 'operatorId', 'lineNumber', 'routeKey'],
  '/gaps_patterns': ['operatorId', 'lineNumber', 'routeKey'],
  '/map': [],
  '/velocity-heatmap': ['timestamp'],
  '/single-line-map': [
    'timestamp',
    'operatorId',
    'lineNumber',
    'vehicleNumber',
    'routeKey',
    'startTime',
  ],
  '/operator': ['operatorId', 'timestamp'],
}

/**
 * Build a shareable URL for the given page.
 *
 * Only the params relevant to that page are included (see PAGE_SHARE_PARAMS).
 * Extra params (e.g. page-local state registered via ExtraShareParamsContext)
 * are appended last and override any SearchContext param with the same key.
 */
export const buildShareUrl = (
  pathname: string,
  search: PageSearchState,
  extraParams: Record<string, string>,
  origin = window.location.origin,
): string => {
  const pagePath = getPathWithoutLang(pathname)
  const relevantKeys = PAGE_SHARE_PARAMS[pagePath] ?? []

  const params = new URLSearchParams()

  for (const key of relevantKeys) {
    const value = search[key]
    if (value) params.set(key, String(value))
  }

  Object.entries(extraParams).forEach(([key, value]) => params.set(key, value))

  const query = params.toString()
  // Use the lang-stripped path so shared links are language-agnostic.
  // The recipient's language preference (localStorage) picks their own lang.
  return `${origin}${pagePath}${query ? `?${query}` : ''}`
}
