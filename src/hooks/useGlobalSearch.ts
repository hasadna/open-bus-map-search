import { useCallback, useContext } from 'react'
import { GlobalSearchContext, type GlobalSearchState } from 'src/model/globalState'

/**
 * GlobalSearchContext plus `updateSearch`, which merges a partial patch into the
 * current state — the common case, without the `(current) => ({ ...current, … })`
 * boilerplate. Use `setSearch` when the next state depends on the current one.
 */
export function useGlobalSearch() {
  const { search, setSearch } = useContext(GlobalSearchContext)
  const updateSearch = useCallback(
    (patch: Partial<GlobalSearchState>) => setSearch((current) => ({ ...current, ...patch })),
    [setSearch],
  )
  return { search, setSearch, updateSearch }
}
