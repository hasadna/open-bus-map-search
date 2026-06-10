import { createContext, Dispatch } from 'react'
import dayjs from 'src/dayjs'
import { toIsraelTimezone } from 'src/dayjs'

/**
 * Global search state shared across all pages via GlobalSearchContext.
 *
 * A field is global if navigating between pages that both use it should
 * preserve the value. Fields meaningful only within a single page belong in
 * that page's local state.
 *
 * `null` means "not selected". Never use undefined or empty string here.
 */
export type GlobalSearchState = {
  /** Selected calendar day as an Israeli date string "YYYY-MM-DD". */
  date: string

  operatorId: string | null
  lineNumber: string | null
  routeKey: string | null
  vehicleNumber: number | null

  /** A specific ride's departure time token (e.g. "14:30").
   *  Set by /gaps when the user clicks a row; consumed by /single-line-map. */
  rideTime: string | null

  /** Selected stop key — shared across /timeline, /single-line-map, /line-profile. */
  stopKey: string | null
}

/** True if the value is a readable "YYYY-MM-DD" calendar date (the format of
 *  GlobalSearchState.date). Used to drop corrupt dates from shared URLs or
 *  stale session storage instead of letting them break every date consumer. */
export const isValidSearchDate = (date: unknown): date is string =>
  typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && dayjs(date).isValid()

export const GLOBAL_SEARCH_DEFAULTS: GlobalSearchState = {
  date: toIsraelTimezone(dayjs()).format('YYYY-MM-DD'),
  operatorId: null,
  lineNumber: null,
  routeKey: null,
  vehicleNumber: null,
  rideTime: null,
  stopKey: null,
}

type MutateStateAction<S> = (prevState: S) => S

export const GlobalSearchContext = createContext<{
  search: GlobalSearchState
  setSearch: Dispatch<MutateStateAction<GlobalSearchState>>
}>({ search: GLOBAL_SEARCH_DEFAULTS, setSearch: (search) => search })
