import { useTranslation } from 'react-i18next'
import { BusRoute } from 'src/model/busRoute'
import { Autocomplete, TextField } from '@mui/material'

type RouteSelectorProps = {
  routes: BusRoute[]
  routeKey: string | undefined
  setRouteKey: (routeKey: string) => void
}

const RouteSelector = ({ routes, routeKey, setRouteKey }: RouteSelectorProps) => {
  const valueFinned = routes.find((route) => route.key === routeKey)
  const value = valueFinned ? valueFinned : null

  const { t } = useTranslation()

  const getRouteTitle = (route: BusRoute) =>
    `${route.fromName} ${t('direction_arrow')} ${route.toName}`

  return (
    <Autocomplete
      disablePortal
      value={value}
      onChange={(e, value) => setRouteKey(value ? value.key : '0')}
      id="route-select"
      options={routes}
      renderInput={(params) => (
        <TextField {...params} label={t('choose_route').replace('XXX', routes.length.toString())} />
      )}
      getOptionLabel={(route) => getRouteTitle(route)}
    />
  )
}

export default RouteSelector
