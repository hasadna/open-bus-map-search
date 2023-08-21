import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import ReactGA from 'react-ga4'

ReactGA.initialize('G-0YRQT80GG1')

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
