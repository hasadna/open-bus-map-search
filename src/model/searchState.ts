/**
 * Global search state shared across all pages.
 *
 * Design rules:
 *   - A field is global if navigating between pages that both use it should
 *     show the same value (e.g. picking operator on /gaps then going to
 *     /timeline should not reset the operator).
 *   - Fields that are only meaningful within a single page live in that
 *     page's own usePageState({ params, ui }) slice instead.
 *   - `null` means "not selected"; never use empty string or undefined here.
 */
export type GlobalSearchState = {
  /** The selected calendar day as Unix ms. Named 'date' not 'timestamp'
   *  because it represents a day, not a precise moment in time. */
  date: number

  operatorId: string | null
  lineNumber: string | null

  /** Compound route-variant string "mkt-direction-alternative".
   *  Kept as a string because BusRoute.key uses the same format. */
  routeKey: string | null

  vehicleNumber: number | null

  /** ISO string of a specific ride's departure time.
   *  Renamed from 'startTime' — it is a ride departure, not a generic start.
   *  Set by /gaps when the user clicks a gap row to inspect that ride
   *  in /single-line-map. Also read/written by /single-line-map itself. */
  rideTime: string | null

  /** The selected stop key, shared across /timeline, /single-line-map, and
   *  /profile — all three display the same route's stops and the user
   *  expects the selection to survive navigation between them. */
  stopKey: string | null
}

export const GLOBAL_SEARCH_DEFAULTS: GlobalSearchState = {
  date: Date.now(),
  operatorId: null,
  lineNumber: null,
  routeKey: null,
  vehicleNumber: null,
  rideTime: null,
  stopKey: null,
}

/**
 * Which global fields each page includes in its share URL.
 *
 * Rules:
 *   - Only list fields that the page actually uses as query inputs.
 *   - Omit fields that are irrelevant (e.g. /gaps doesn't use stopKey or
 *     vehicleNumber, so including them would confuse recipients).
 *   - Pages absent from this map get no global params in the share URL.
 *   - Page-specific params (startDate, visMode, etc.) are registered
 *     separately via usePageState → ExtraShareParamsContext.
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
  // /profile/:id — route ID is already in the URL path; rideTime and stopKey
  // come through as page params via ExtraShareParamsContext
}
