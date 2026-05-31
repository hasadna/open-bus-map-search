import { createContext } from 'react'

export const ExtraShareParamsContext = createContext<{
  params: Record<string, string>
  setParams: (params: Record<string, string>) => void
}>({ params: {}, setParams: () => {} })

// URL params captured synchronously on mount — available to lazy-loaded pages
// even after MainRoute has stripped them from the address bar.
export const InitialUrlParamsContext = createContext<Record<string, string>>({})
