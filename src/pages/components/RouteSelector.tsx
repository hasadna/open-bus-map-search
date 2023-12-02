import { formatted, TEXTS } from 'src/resources/texts'
import { BusRoute } from 'src/model/busRoute'
import { Autocomplete, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'

type RouteSelectorProps = {
  routes: BusRoute[]
  routeKey: string | undefined
  setRouteKey: (routeKey: string) => void
}

const getRouteTitle = (route: BusRoute, t: TFunction<'translation', undefined>) =>
  `${route.fromName} ${TEXTS.direction_arrow} ${route.toName}  ${
    route.routeAlternative === '#' || route.routeAlternative === '0'
      ? ''
      : `(${t('halufa_ride')} ${route.routeAlternative})`
  }`

const RouteSelector = ({ routes, routeKey, setRouteKey }: RouteSelectorProps) => {
  const valueFinned = routes.find((route) => route.key === routeKey)
  const value = valueFinned ? valueFinned : null
  const { t } = useTranslation()
  useEffect(() => {
    routes.sort((a, b) => {
      if (
        a.fromName === b.fromName &&
        a.routeAlternative !== '#' &&
        a.routeAlternative !== '0' &&
        a.routeAlternative > b.routeAlternative
      ) {
        return 1
      }
      return a.fromName > b.fromName ? 1 : -1
    })
  }, [routes])
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
      getOptionLabel={(route) => getRouteTitle(route, t)}
    />
  )
}

export default RouteSelector
