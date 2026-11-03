import { act, renderHook } from '@testing-library/react'
import { type ReactNode, useState } from 'react'
import {
  GLOBAL_SEARCH_DEFAULTS,
  GlobalSearchContext,
  type GlobalSearchState,
} from 'src/model/globalState'
import { useGlobalSearch } from './useGlobalSearch'

function Provider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState<GlobalSearchState>({
    ...GLOBAL_SEARCH_DEFAULTS,
    operatorId: '3',
    lineNumber: '480',
  })
  return (
    <GlobalSearchContext.Provider value={{ search, setSearch }}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

describe('useGlobalSearch', () => {
  it('updateSearch merges the patch and keeps the other fields', () => {
    const { result } = renderHook(() => useGlobalSearch(), { wrapper: Provider })

    act(() => result.current.updateSearch({ lineNumber: '1', routeKey: null }))

    expect(result.current.search).toEqual({
      ...GLOBAL_SEARCH_DEFAULTS,
      operatorId: '3',
      lineNumber: '1',
      routeKey: null,
    })
  })

  it('consecutive updates in one batch both apply', () => {
    const { result } = renderHook(() => useGlobalSearch(), { wrapper: Provider })

    act(() => {
      result.current.updateSearch({ lineNumber: '1' })
      result.current.updateSearch({ stopKey: 'abc' })
    })

    expect(result.current.search.lineNumber).toBe('1')
    expect(result.current.search.stopKey).toBe('abc')
  })

  it('updateSearch is referentially stable across renders', () => {
    const { result } = renderHook(() => useGlobalSearch(), { wrapper: Provider })
    const first = result.current.updateSearch

    act(() => result.current.updateSearch({ lineNumber: '1' }))

    expect(result.current.updateSearch).toBe(first)
  })
})
