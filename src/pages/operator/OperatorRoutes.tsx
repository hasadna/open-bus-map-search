import { ArrowBack, ArrowForward, Clear, ExpandMore, Search } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import styled from 'styled-components'
import { useDebounceValue } from 'usehooks-ts'
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
  const [query, setQuery] = useState('')
  // Filter on a debounced copy so each keystroke doesn't re-run the filter and
  // re-mount expanded groups; the input itself stays bound to `query` (instant).
  const [debouncedQuery] = useDebounceValue(query, 500)

  const trimmedQuery = debouncedQuery.trim().toLowerCase()

  // Search is line-first: the query matches against the displayed line number,
  // but also against each route's origin/destination so a place name surfaces
  // the lines that serve it. A matching route's whole line group stays visible.
  const groups = useMemo<RouteGroup[]>(() => {
    const byLine = new Map<string, RouteGroup>()
    for (const route of routes) {
      const label = isNaN(route.line) ? '' : route.line + route.suffix
      if (
        trimmedQuery &&
        !label.toLowerCase().includes(trimmedQuery) &&
        !route.start.toLowerCase().includes(trimmedQuery) &&
        !route.end.toLowerCase().includes(trimmedQuery)
      ) {
        continue
      }
      let group = byLine.get(label)
      if (!group) {
        group = { label, routes: [] }
        byLine.set(label, group)
      }
      group.routes.push(route)
    }
    // routes are already sorted by line/suffix, so insertion order preserves it
    return [...byLine.values()]
  }, [routes, trimmedQuery])

  const matchingRoutes = useMemo(() => groups.reduce((n, g) => n + g.routes.length, 0), [groups])

  return (
    <Widget
      title={
        <>
          {t('operator.all_lines_on_date')}
          {!isLoading && routes.length > 0 && (
            <TitleCount>
              {'('}
              {t('operator.routes_in_lines', { routes: matchingRoutes, lines: groups.length })}
              {')'}
            </TitleCount>
          )}
        </>
      }
      marginBottom>
      {!isLoading && routes.length > 0 && (
        <TextField
          size="small"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('operator.search_placeholder')}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label={t('operator.clear')}
                    onClick={() => setQuery('')}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
          sx={{ mb: 1 }}
        />
      )}
      <Box sx={{ maxHeight: 345, overflow: 'auto' }}>
        {isLoading ? (
          <SkeletonLoader active rows={8} />
        ) : groups.length === 0 && trimmedQuery ? (
          <Typography sx={{ p: 2, opacity: 0.6 }}>{t('operator.no_results')}</Typography>
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
        {/* Both layouts stay in the DOM, toggled by CSS at `sm` (not a JS branch, so no
            first-render flash and Applitools captures both). Collapsed groups render
            nothing thanks to the Accordion's unmountOnExit, so the duplication is free. */}
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          {group.routes.map((route) => (
            <StackedRoute key={route.id}>
              <StackedTable>
                <tbody>
                  <tr>
                    <StackedLabelCell>{t('operator.origin')}:</StackedLabelCell>
                    <StackedValueCell>{route.start}</StackedValueCell>
                  </tr>
                  <tr>
                    <StackedLabelCell>{t('operator.destination')}:</StackedLabelCell>
                    <StackedValueCell>{route.end}</StackedValueCell>
                  </tr>
                </tbody>
              </StackedTable>
              <StackedActions>
                {profileLink(route)}
                {mapLink(route)}
              </StackedActions>
            </StackedRoute>
          ))}
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('operator.origin')}</TableCell>
                <TableCell padding="none" />
                <TableCell>{t('operator.destination')}</TableCell>
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
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {profileLink(route)}
                      {mapLink(route)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
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
    border-bottom: 2px solid rgba(128, 128, 128, 0.5);
  }
`

const StackedTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`

const StackedLabelCell = styled.td`
  opacity: 0.6;
  vertical-align: top;
  white-space: nowrap;
  width: 1%;
  padding-inline-end: 0.5rem;
`

const StackedValueCell = styled.td`
  vertical-align: top;
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
