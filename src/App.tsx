import { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RouterProvider } from 'react-router'
import router from './routes'
import Preloader from './shared/Preloader'
import './App.scss'
import 'leaflet/dist/leaflet.css'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then((reg) => console.log('Service Worker Registered', reg))
    .catch((err) => console.error('Service Worker Registration Failed', err))
}

export const RoutedApp = () => {
  const { i18n } = useTranslation() // Access i18n for language management
  const currentLanguage = i18n.language // Get the current language

  // Effect hook to update the title based on the current language
  useEffect(() => {
    const title = currentLanguage === 'he' ? 'דאטאבוס' : 'Databus' // Set title based on language
    document.title = title // Update the <title> tag in the document
  }, [currentLanguage]) // Re-run when the language changes

  return (
    <Suspense fallback={<Preloader />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
export default RoutedApp
