import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { RouterProvider } from 'react-router'
import router from './routes'
import Preloader from './shared/Preloader'
import 'leaflet/dist/leaflet.css'
import './App.scss'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then((reg) => console.log('Service Worker Registered', reg))
    .catch((err) => console.error('Service Worker Registration Failed', err))
}

export const RoutedApp = () => {
  const { ready } = useTranslation()

  return (
    <Suspense fallback={<Preloader />}>
      {ready ? <RouterProvider router={router} /> : null}
    </Suspense>
  )
}
export default RoutedApp
