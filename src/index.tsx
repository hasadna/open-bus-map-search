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

/** An answer with nothing in it — `[]`, `null`, or the `null` a page returns instead of
 *  rethrowing. "There is genuinely nothing" and "this date is not ingested yet" look
 *  identical from here, which is why neither is worth keeping. */
const isEmptyResult = (data: unknown) => data == null || (Array.isArray(data) && data.length === 0)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      // An empty result is the one answer that must never be trusted for long: it is what
      // the API returns for a date its ETL has not loaded yet, so it stops being true
      // without anything in the app noticing. Real data is worth keeping for a while.
      staleTime: (query) => (isEmptyResult(query.state.data) ? 0 : 1000 * 60 * 30),
      refetchOnWindowFocus: false,
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
