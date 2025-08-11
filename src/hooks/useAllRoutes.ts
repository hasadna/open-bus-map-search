import { GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'
import { useEffect, useState } from 'react'
import { getAllRoutesList } from 'src/api/gtfsService'
import { routeStartEnd } from 'src/pages/components/utils/rotueUtils'

type AllRoutesState = {
  routes: RouteItem[]
  isLoading: boolean
  error: boolean
}

export const useAllRoutes = (operatorId?: string, timestamp?: number) => {
  const [state, setState] = useState<AllRoutesState>({ routes: [], isLoading: true, error: false })

  useEffect(() => {
    if (!operatorId || !timestamp) {
      setState({ routes: [], isLoading: false, error: false })
      return
    }

    setState({ routes: [], isLoading: true, error: false })
    const controller = new AbortController()
    const date = new Date(timestamp)

    getAllRoutesList(operatorId, date, controller.signal)
      .then((routes) => {
        setState({ routes: mapperRoutes(routes), isLoading: false, error: false })
      })
      .catch((err) => {
        setState({ routes: [], isLoading: false, error: true })
        console.error(err?.message ?? err)
      })

    return () => controller.abort()
  }, [operatorId, timestamp])

  return state
}

type RouteItem = {
  id: number
  line: number
  suffix: string
  start: string
  end: string
  routeKey: string
}

function mapperRoutes(routes: GtfsRoutePydanticModel[]) {
  return routes
    .map(({ id, routeShortName, routeLongName }) => {
      const [start, end] = routeStartEnd(routeLongName)
      const [, routeLine, routeSuffix] = routeShortName?.match(/^(\d+)(.*)$/) ?? []
      const line = Number(routeLine)
      const suffix = line && routeSuffix ? routeSuffix : ''
      return { id, line, suffix, start, end, routeKey: routeLongName || '' } as RouteItem
    })
    .sort((a, b) => a.line - b.line || a.suffix.localeCompare(b.suffix, 'he'))
}
