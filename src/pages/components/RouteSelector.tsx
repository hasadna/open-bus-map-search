import { formatted, TEXTS } from 'src/resources/texts'
import React from 'react'
import { BusRoute } from 'src/model/busRoute'
import SelectWithOptions from 'src/pages/components/SelectWithOptionts'

type RouteSelectorProps = {
  routes: BusRoute[]
  routeKey: string | undefined
  setRouteKey: (routeKey: string) => void
}

const getRouteTitle = (route: BusRoute) =>
  `${route.fromName} ${TEXTS.direction_arrow} ${route.toName}`

const RouteSelector = ({ routes, routeKey, setRouteKey }: RouteSelectorProps) => {
  return (
    <SelectWithOptions
      items={routes}
      selected={routeKey}
      setSelected={setRouteKey}
      placeholder={formatted(TEXTS.choose_route, routes.length.toString())}
      getItemKey={(route) => route.key}
      getItemDisplay={(route) => getRouteTitle(route)}
    />
  )
}

export default RouteSelector
