import './App.scss'
import 'leaflet/dist/leaflet.css'
import 'moment/locale/he'
import { RouterProvider } from 'react-router-dom'
import { Suspense } from 'react'
import moment from 'moment-timezone'
import Preloader from './shared/Preloader'
import router from './routes'
import 'moment/dist/locale/he'

moment.tz.setDefault('Asia/Jerusalem')
moment.locale('he')

export const RoutedApp = () => (
  <Suspense fallback={<Preloader />}>
    <RouterProvider router={router} />
  </Suspense>
)
export default RoutedApp
