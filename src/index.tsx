import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import {
  type PersistedClient,
  PersistQueryClientProvider,
  removeOldestQuery,
} from '@tanstack/react-query-persist-client'
import { createStore, del, get, set } from 'idb-keyval'
import React from 'react'
import ReactDOM from 'react-dom/client'
import ReactGAImport from 'react-ga4'
import App from './App'
import './locale/allTranslations'
import './index.scss'

const queryCacheStore = createStore('open-bus-map-search', 'react-query')

/** One dashboard visit persists ~2MB of a ~5MB localStorage budget, and over the quota the
 *  persister has nowhere to report the failure: it abandons the whole write silently, so the
 *  app simply stops persisting. IndexedDB's quota is a share of free disk instead. */
const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get(key, queryCacheStore),
    setItem: (key, value) => set(key, value, queryCacheStore),
    removeItem: (key) => del(key, queryCacheStore),
  },
  /* IndexedDB stores a structured clone, so the cache goes to disk as an object graph and
   * comes back as one — skipping a JSON round trip over megabytes, and keeping `Date` fields
   * as Dates instead of the strings `JSON.parse` would hand back. The persister types the
   * stored value as a string because most storages can only hold one; nothing between these
   * two functions ever treats it as such. */
  serialize: (client) => client as unknown as string,
  deserialize: (stored) => stored as unknown as PersistedClient,
  retry: removeOldestQuery,
})

// Nothing reads the localStorage cache any more, and an abandoned one keeps its megabytes for
// the life of the browser profile.
window.localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE')

/** An answer with nothing in it — `[]`, or the `null` a page returns instead of rethrowing.
 *  "There is genuinely nothing" and "this date is not ingested yet" look identical from
 *  here, which is why neither is worth keeping. */
const isEmptyResult = (data: unknown) => data == null || (Array.isArray(data) && data.length === 0)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      // Keeping an empty result for a day would outlive the ingestion gap that produced it,
      // and the service worker declining to store one cannot help while nothing re-asks.
      refetchOnMount: (query) => (isEmptyResult(query.state.data) ? 'always' : false),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
})

// react-ga4's default export is nested under `.default` under some CJS/ESM interop
// (e.g. Vite/Rolldown), so unwrap it to keep the shared singleton.
const ReactGA =
  (ReactGAImport as unknown as { default?: typeof ReactGAImport }).default ?? ReactGAImport

try {
  ReactGA.initialize('G-0YRQT80GG1')
} catch (e) {
  console.error('Failed to initialize Google Analytics', e)
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <App />
    </PersistQueryClientProvider>
  </React.StrictMode>,
)
