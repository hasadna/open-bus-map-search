import { createContext, Dispatch } from 'react'
import { GLOBAL_SEARCH_DEFAULTS, GlobalSearchState } from './searchState'

type MutateStateAction<S> = (prevState: S) => S

export const SearchContext = createContext<{
  search: GlobalSearchState
  setSearch: Dispatch<MutateStateAction<GlobalSearchState>>
}>({
  search: GLOBAL_SEARCH_DEFAULTS,
  setSearch: (s) => s,
})

/** Page-specific shareable params registered by usePageState.
 *  The share button merges these with the relevant global fields to build
 *  the copy URL. Replaces the ad-hoc ExtraShareParamsContext pattern. */
export const ExtraShareParamsContext = createContext<{
  params: Record<string, string>
  setParams: (params: Record<string, string>) => void
}>({ params: {}, setParams: () => {} })

/** URL params captured synchronously on mount — available to lazy-loaded
 *  pages even after MainRoute has stripped them from the address bar. */
export const InitialUrlParamsContext = createContext<Record<string, string>>({})

// Re-export for convenience so consumers don't need to import from two files.
export type { GlobalSearchState }
