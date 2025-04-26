import { Autocomplete, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { BusRoute } from 'src/model/busRoute'
import { formatted } from 'src/locale/utils'

type RouteSelectorProps = {
  routes: BusRoute[]
  routeKey?: string
  disabled?: boolean
  setRouteKey: (routeKey?: string) => void
}

const getRouteTitle = (route: BusRoute, t: TFunction<'translation', undefined>) =>
  `${route.fromName} ${t('direction_arrow')} ${route.toName}  ${
    route.routeAlternative === '#' || route.routeAlternative === '0'
      ? ''
      : `(${t('halufa_ride')} ${route.routeAlternative})`
  }`

const RouteSelector = ({ routes, routeKey, disabled, setRouteKey }: RouteSelectorProps) => {
  const { t } = useTranslation()
  const value = routes.find((route) => route.key === routeKey)

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
      disabled={disabled}
      value={value}
      onChange={(e, value) => setRouteKey(value?.key)}
      id="route-select"
      options={routes}
      renderInput={(params) => (
        <TextField {...params} label={formatted(t('choose_route'), routes.length.toString())} />
      )}
      getOptionLabel={(route) => getRouteTitle(route, t)}
    />
  )
}

export default RouteSelector
