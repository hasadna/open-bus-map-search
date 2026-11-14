import { useQueryClient } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { applyStrideApiBasePath } from 'src/api/apiConfig'
import { isStrideLiteOptedIn, isStrideLiteSelected, setStrideLiteOptedIn } from 'src/api/strideLite'

/** Lets the header button and the status page's switch show the same state. */
const CHANGE_EVENT = 'stride-lite-opt-in-change'

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export const useStrideLiteOptIn = () => {
  const queryClient = useQueryClient()
  const optedIn = useSyncExternalStore(subscribe, isStrideLiteOptedIn)
  const setOptedIn = (value: boolean) => {
    setStrideLiteOptedIn(value)
    applyStrideApiBasePath()
    window.dispatchEvent(new Event(CHANGE_EVENT))
    void queryClient.resetQueries()
  }
  return { optedIn, setOptedIn }
}

export const useStrideLiteSelected = () => useSyncExternalStore(subscribe, isStrideLiteSelected)
