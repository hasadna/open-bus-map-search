import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import ReactGA from 'react-ga4'
import './locale/allTranslations'
import { QueryClient, QueryClientProvider } from 'react-query'

ReactGA.initialize('G-0YRQT80GG1')

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
const client = new QueryClient()
root.render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
