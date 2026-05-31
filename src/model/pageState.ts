import { createContext } from 'react'

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
