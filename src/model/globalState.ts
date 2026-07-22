import { createContext, Dispatch } from 'react'
import { type CivilDate, todayCivilDate } from 'src/model/time/civilDate'

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
  /** Selected calendar day, as a CivilDate ("YYYY-MM-DD"). */
  date: CivilDate

  operatorId: string | null
  lineNumber: string | null
  routeKey: string | null

  /** A specific ride's departure time token (e.g. "14:30").
   *  Set by /gaps when the user clicks a row; consumed by /single-line-map. */
  rideTime: string | null

  /** Selected stop key — shared across /timeline, /single-line-map, /line-profile. */
  stopKey: string | null
}

export const GLOBAL_SEARCH_DEFAULTS: GlobalSearchState = {
  date: todayCivilDate(),
  operatorId: null,
  lineNumber: null,
  routeKey: null,
  rideTime: null,
  stopKey: null,
}

type MutateStateAction<S> = (prevState: S) => S

export const GlobalSearchContext = createContext<{
  search: GlobalSearchState
  setSearch: Dispatch<MutateStateAction<GlobalSearchState>>
}>({ search: GLOBAL_SEARCH_DEFAULTS, setSearch: (search) => search })
