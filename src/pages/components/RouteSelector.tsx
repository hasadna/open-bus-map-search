import { formatted, TEXTS } from 'src/resources/texts'
import { BusRoute } from 'src/model/busRoute'
import { Autocomplete, TextField } from '@mui/material'

type RouteSelectorProps = {
  routes: BusRoute[]
  routeKey: string | undefined
  setRouteKey: (routeKey: string) => void
}

const getRouteTitle = (route: BusRoute) =>
  `${route.fromName} ${TEXTS.direction_arrow} ${route.toName}`

const RouteSelector = ({ routes, routeKey, setRouteKey }: RouteSelectorProps) => {
  const valueFinned = routes.find((route) => route.key === routeKey)
  const value = valueFinned ? valueFinned : null

  return (
    <Autocomplete
      disablePortal
      value={value}
      onChange={(e, value) => setRouteKey(value ? value.key : '0')}
      id="route-select"
      options={routes}
      renderInput={(params) => (
        <TextField {...params} label={formatted(TEXTS.choose_route, routes.length.toString())} />
      )}
      getOptionLabel={(route) => getRouteTitle(route)}
    />
  )
}

export default RouteSelector
