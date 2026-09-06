import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import React from 'react'
import ReactDOM from 'react-dom/client'
import ReactGAImport from 'react-ga4'
import App from './App'
import './locale/allTranslations'
import './index.scss'

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
})

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
