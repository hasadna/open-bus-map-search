import './App.scss'
import 'leaflet/dist/leaflet.css'
import 'moment/locale/he'
import router from './routes'
import { RouterProvider } from 'react-router-dom'
import { Suspense } from 'react'
import Preloader from './shared/Preloader'

export const RoutedApp = () => (
  <Suspense fallback={<Preloader />}>
    <RouterProvider router={router} />
  </Suspense>
)
export default RoutedApp
