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
} from '@mui/material'
import { Skeleton } from 'antd'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import styled from 'styled-components'
import { GlobalSearchContext } from 'src/model/globalState'
import { ISRAEL_TRAIN_ID } from 'src/model/operator'
import Widget from 'src/shared/Widget'
import { useAllRoutes } from '../../hooks/useAllRoutes'

type Route = ReturnType<typeof useAllRoutes>['routes'][number]

type RouteGroup = {
  label: string
  routes: Route[]
}

export const OperatorRoutes = ({ operatorId, date }: { operatorId?: string; date?: Date }) => {
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
          <Skeleton active paragraph={{ rows: 8 }} />
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
  const DirectionArrow = i18n.dir() === 'rtl' ? ArrowBack : ArrowForward

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
                <TableCell>
                  <Link to={`/profile/${route.id}`}>{t('operator.profile')}</Link>
                </TableCell>
                <TableCell>
                  {operatorId !== ISRAEL_TRAIN_ID && (
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
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  )
}

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
