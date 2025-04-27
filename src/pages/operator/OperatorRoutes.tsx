import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { GtfsApi } from 'open-bus-stride-client'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { routeStartEnd } from '../components/utils/rotueUtils'
import { API_CONFIG } from 'src/api/apiConfig'
import { SearchContext } from 'src/model/pageState'
import Widget from 'src/shared/Widget'

export const OperatorRoutes = ({
  operatorId,
  timestamp,
}: {
  operatorId?: string
  timestamp?: number
}) => {
  const [routes, setRoutes] = useState<RouteItem[]>([])
  const { setSearch } = useContext(SearchContext)
  const { t } = useTranslation()

  useEffect(() => {
    if (operatorId && timestamp) {
      const controller = new AbortController()
      const date = new Date(timestamp)

      getRoutesList(operatorId, date, controller.signal)
        .then((routes) => {
          setRoutes(routes)
        })
        .catch((err) => {
          console.error(err?.message ?? err)
          setRoutes([])
        })

      return () => controller.abort()
    } else {
      setRoutes([])
    }
  }, [operatorId, timestamp])

  return (
    <Widget last>
      <Typography sx={{ marginInlineStart: '0.5rem' }} variant="h5">
        {t('operator.all_lines')}
      </Typography>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t('operator.line')}</TableCell>
              <TableCell>{t('operator.origin')}</TableCell>
              <TableCell>{t('operator.destination')}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell>{isNaN(route.line) ? '' : route.line + route.suffix}</TableCell>
                <TableCell>{route.start}</TableCell>
                <TableCell>{route.end}</TableCell>
                <TableCell>
                  <Link to={`/profile/${route.id}`}>{t('operator.profile')}</Link>
                </TableCell>
                <TableCell>
                  <Link
                    onClick={() => {
                      setSearch((current) => ({
                        ...current,
                        lineNumber: route.line + route.suffix,
                        routeKey: route.routeKey,
                      }))
                    }}
                    to="/single-line-map">
                    {t('operator.map')}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Widget>
  )
}

const GTFS_API = new GtfsApi(API_CONFIG)

type RouteItem = {
  id: number
  line: number
  suffix: string
  start: string
  end: string
  routeKey: string
}

async function getRoutesList(operatorId: string, date: Date, signal?: AbortSignal) {
  const routes = await GTFS_API.gtfsRoutesListGet(
    {
      operatorRefs: operatorId,
      dateFrom: date,
      dateTo: date,
      orderBy: 'route_long_name asc',
      limit: -1,
    },
    { signal },
  )
  return routes
    .map(({ id, routeShortName, routeLongName }) => {
      const [start, end] = routeStartEnd(routeLongName)
      const [, routeLine, routeSuffix] = routeShortName?.match(/^(\d+)(.*)$/) ?? []
      const line = Number(routeLine)
      const suffix = line && routeSuffix ? routeSuffix : ''
      return { id, line, suffix, start, end, routeKey: routeLongName } as RouteItem
    })
    .sort((a, b) => a.line - b.line || a.suffix.localeCompare(b.suffix, 'he'))
}
