import { ArrowBack, ArrowForward, ExpandMore } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import styled from 'styled-components'
import { GlobalSearchContext } from 'src/model/globalState'
import { ISRAEL_TRAIN_ID } from 'src/model/operator'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import Widget from 'src/shared/Widget'
import { useAllRoutes } from '../../hooks/useAllRoutes'

type Route = ReturnType<typeof useAllRoutes>['routes'][number]

type RouteGroup = {
  label: string
  routes: Route[]
}

export const OperatorRoutes = ({ operatorId, date }: { operatorId?: string; date?: string }) => {
  const { t } = useTranslation()
  const { routes, isLoading } = useAllRoutes(operatorId, date)

  const groups = useMemo<RouteGroup[]>(() => {
    const byLine = new Map<string, RouteGroup>()
    for (const route of routes) {
      const label = isNaN(route.line) ? '' : route.line + route.suffix
      let group = byLine.get(label)
      if (!group) {
        group = { label, routes: [] }
        byLine.set(label, group)
      }
      group.routes.push(route)
    }
    // routes are already sorted by line/suffix, so insertion order preserves it
    return [...byLine.values()]
  }, [routes])

  return (
    <Widget
      title={
        <>
          {t('operator.all_lines')}
          {!isLoading && routes.length > 0 && (
            <TitleCount>
              {'('}
              {t('operator.routes_in_lines', { routes: routes.length, lines: groups.length })}
              {')'}
            </TitleCount>
          )}
        </>
      }
      marginBottom>
      <Box sx={{ maxHeight: 345, overflow: 'auto' }}>
        {isLoading ? (
          <SkeletonLoader active rows={8} />
        ) : (
          groups.map((group) => (
            <RouteGroup key={group.label || '—'} group={group} operatorId={operatorId} />
          ))
        )}
      </Box>
    </Widget>
  )
}

const RouteGroup = ({ group, operatorId }: { group: RouteGroup; operatorId?: string }) => {
  const { t, i18n } = useTranslation()
  const { setSearch } = useContext(GlobalSearchContext)
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const DirectionArrow = i18n.dir() === 'rtl' ? ArrowBack : ArrowForward

  const profileLink = (route: Route) => (
    <Link to={`/profile/${route.id}`}>{t('operator.profile')}</Link>
  )

  const mapLink = (route: Route) =>
    operatorId !== ISRAEL_TRAIN_ID && (
      <Link
        onClick={(e) => {
          e.preventDefault()
          setSearch((current) => ({
            ...current,
            lineNumber: route.line + route.suffix,
            routeKey: route.routeKey,
          }))
          navigate('/single-line-map')
        }}
        to={`/single-line-map`}>
        {t('operator.map')}
      </Link>
    )

  return (
    <Accordion
      disableGutters
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        '&.Mui-expanded::before': { opacity: 1 },
        '&.Mui-expanded + &::before': { display: 'block' },
      }}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          flexDirection: 'row-reverse',
          gap: 1,
          '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 },
        }}>
        <LineLabel>{group.label}</LineLabel>
        <RouteCount>{t('operator.routes_count', { count: group.routes.length })}</RouteCount>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {isMobile ? (
          group.routes.map((route) => (
            <StackedRoute key={route.id}>
              <div>
                <StackedLabel>{t('operator.origin')}: </StackedLabel>
                {route.start}
              </div>
              <div>
                <StackedLabel>{t('operator.destination')}: </StackedLabel>
                {route.end}
              </div>
              <StackedActions>
                {profileLink(route)}
                {mapLink(route)}
              </StackedActions>
            </StackedRoute>
          ))
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('operator.origin')}</TableCell>
                <TableCell padding="none" />
                <TableCell>{t('operator.destination')}</TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {group.routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.start}</TableCell>
                  <TableCell padding="none">
                    <DirectionArrow fontSize="inherit" sx={{ opacity: 0.5, display: 'block' }} />
                  </TableCell>
                  <TableCell>{route.end}</TableCell>
                  <TableCell>{profileLink(route)}</TableCell>
                  <TableCell>{mapLink(route)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

const StackedRoute = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  }
`

const StackedLabel = styled.span`
  opacity: 0.6;
`

const StackedActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.15rem;
`

const LineLabel = styled.strong`
  min-width: 3rem;
  font-size: 1.1rem;
`

const RouteCount = styled.span`
  background-color: #e3f2fd;
  color: #1565c0;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
`

const TitleCount = styled.span`
  display: block;
  font-size: 0.875rem;
  font-weight: normal;
  line-height: 1.2;
  opacity: 0.6;
`
