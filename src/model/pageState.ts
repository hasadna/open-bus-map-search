import { createContext } from 'react'
import { GlobalSearchState } from 'src/model/globalState'

/** Page-specific shareable params registered by usePageState.
 *  The share button merges these with the relevant global fields to build
 *  the copy URL. */
export const PageShareParamsContext = createContext<{
  params: Record<string, string>
  setParams: (params: Record<string, string>) => void
}>({ params: {}, setParams: () => {} })

/** URL params captured synchronously on mount — available to lazy-loaded
 *  pages even after MainRoute has stripped them from the address bar. */
export const InitialUrlParamsContext = createContext<Record<string, string>>({})

/**
 * Which global fields each page includes in its share URL.
 *
 * Rules:
 *   - Only list fields that the page actually uses as query inputs.
 *   - Omit fields that are irrelevant (e.g. /gaps doesn't use stopKey or
 *     vehicleNumber, so including them would confuse recipients).
 *   - Pages absent from this map get no global params in the share URL.
 *   - Page-specific params (startDate, visMode, etc.) are registered
 *     separately via usePageState → PageShareParamsContext.
 */
export const PAGE_GLOBAL_SHARE_KEYS: Partial<Record<string, (keyof GlobalSearchState)[]>> = {
  '/timeline': ['date', 'operatorId', 'lineNumber', 'routeKey', 'stopKey'],
  '/gaps': ['date', 'operatorId', 'lineNumber', 'routeKey'],
  // /gaps_patterns uses a date range in page params, not global date
  '/gaps_patterns': ['operatorId', 'lineNumber', 'routeKey'],
  // /map owns its full datetime in page params — independent of global date
  // because the default is hardcoded to Pi day for performance reasons
  '/map': [],
  '/velocity-heatmap': ['date'],
  '/single-line-map': [
    'date',
    'operatorId',
    'lineNumber',
    'routeKey',
    'vehicleNumber',
    'rideTime',
    'stopKey',
  ],
  '/operator': ['operatorId', 'date'],
  // /profile/:id — route ID is in the URL path; global fields are still shared so
  // recipients land with the same operator/line/route/stop context.
  '/profile': ['date', 'operatorId', 'lineNumber', 'routeKey', 'stopKey'],
}
