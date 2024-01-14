import './App.scss'
import 'leaflet/dist/leaflet.css'
import 'moment/locale/he'
import router from './routes'
import { RouterProvider } from 'react-router-dom'
import { Suspense } from 'react'
import Preloader from './shared/Preloader'
import moment from 'moment-timezone'
import "moment/dist/locale/he"

moment.tz.setDefault('Asia/Jerusalem');
moment.locale("he");

export const RoutedApp = () => (
  <Suspense fallback={<Preloader />}>
    <RouterProvider router={router} />
  </Suspense>
)
export default RoutedApp
