import {
  Alert,
  AlertTitle,
  Box,
  FormControlLabel,
  Grid,
  Link,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  isStrideLiteConfigured,
  isStrideLiteOptedIn,
  setStrideLiteOptedIn,
  strideLiteApiBasePath,
  strideLiteCoverageQueryOptions,
  strideLiteStatusQueryOptions,
} from 'src/api/strideLite'
import { civilDateToDayjs } from 'src/model/time/civilDate'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import Widget from 'src/shared/Widget'
import { PageContainer } from '../components/PageContainer'
import { CoverageChart } from './CoverageChart'
import {
  expectedSnapshots,
  expectedVehicleLocations,
  isFault,
  withHealthOldestFirst,
} from './coverageHealth'
import { healthColor, HealthIcon, healthLabelKey } from './healthDisplay'

const COVERAGE_DAYS = 90

const StatTile = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, height: '100%' }}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Typography>
  </Box>
)

const BackendSwitch = () => {
  const { t } = useTranslation()
  return (
    <Stack spacing={1}>
      <FormControlLabel
        control={
          <Switch
            checked={isStrideLiteOptedIn()}
            disabled={!isStrideLiteConfigured()}
            onChange={(event) => {
              setStrideLiteOptedIn(event.target.checked)
              // The api-client is configured once at module load, so the switch only takes
              // effect on the next load.
              window.location.reload()
            }}
            slotProps={{ input: { 'aria-label': t('strideLite.backend_switch_label') } }}
          />
        }
        label={t('strideLite.backend_switch_label')}
      />
      {isStrideLiteConfigured() && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('strideLite.backend_switch_hint', {
            url: strideLiteApiBasePath(),
            // The URL comes from our own build configuration, and i18next's HTML escaping
            // would render its slashes as entities.
            interpolation: { escapeValue: false },
          })}
        </Typography>
      )}
    </Stack>
  )
}

const Unreachable = ({ error }: { error: Error }) => {
  const { t } = useTranslation()
  return (
    <Alert severity="warning">
      <AlertTitle>{t('strideLite.unreachable')}</AlertTitle>
      <Typography variant="body2">{error.message}</Typography>
    </Alert>
  )
}

const StatusSection = () => {
  const { t, i18n } = useTranslation()
  const { data, error, isLoading } = useQuery(strideLiteStatusQueryOptions())
  const full = new Intl.NumberFormat(i18n.language)

  if (error) return <Unreachable error={error} />
  if (isLoading || !data) return <SkeletonLoader />

  const tiles = [
    { label: t('strideLite.newest_snapshot'), value: data.newestSnapshot },
    { label: t('strideLite.vehicle_locations'), value: full.format(data.vehicleLocations) },
    {
      label: t('strideLite.newest_gtfs_date'),
      value: data.newestGtfsDate ? civilDateToDayjs(data.newestGtfsDate).format('DD/MM/YYYY') : '—',
    },
    { label: t('strideLite.refresh_tasks'), value: full.format(data.refreshTasks) },
    {
      label: t('strideLite.refresh_tasks_failing'),
      value: full.format(data.refreshTasksFailing),
    },
  ]

  return (
    <Stack spacing={2}>
      {data.refreshTasksFailing > 0 && (
        <Alert severity="error">
          {t('strideLite.refresh_tasks_failing_alert', { count: data.refreshTasksFailing })}
        </Alert>
      )}
      <Grid container spacing={2}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <StatTile {...tile} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}

const CoverageSection = () => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const { data, error, isLoading } = useQuery(strideLiteCoverageQueryOptions(COVERAGE_DAYS))
  const full = new Intl.NumberFormat(i18n.language)

  if (error) return <Unreachable error={error} />
  if (isLoading || !data) return <SkeletonLoader />

  const days = withHealthOldestFirst(data)
  const faults = days.filter((day) => isFault(day.health)).reverse()

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle1">{t('strideLite.snapshots_chart_title')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {t('strideLite.snapshots_chart_subtitle')}
        </Typography>
        <CoverageChart days={days} metric="snapshots" expectedFor={expectedSnapshots} />
      </Box>
      <Box>
        <Typography variant="subtitle1">{t('strideLite.locations_chart_title')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {t('strideLite.locations_chart_subtitle')}
        </Typography>
        <CoverageChart
          days={days}
          metric="vehicleLocations"
          expectedFor={(day) => expectedVehicleLocations(day.day)}
        />
      </Box>
      <Box>
        <Typography variant="subtitle1">{t('strideLite.faults_title')}</Typography>
        {faults.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('strideLite.no_faults', { count: days.length })}
          </Typography>
        ) : (
          <Table size="small" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('strideLite.day')}</TableCell>
                <TableCell>{t('strideLite.health_column')}</TableCell>
                <TableCell align="right">{t('strideLite.snapshots')}</TableCell>
                <TableCell align="right">{t('strideLite.vehicle_locations')}</TableCell>
                <TableCell align="right">{t('strideLite.duplicate_ids')}</TableCell>
                <TableCell align="right">{t('strideLite.rides_linked_to_gtfs')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faults.map((day) => (
                <TableRow key={day.day}>
                  <TableCell>
                    {/* eslint-disable-next-line i18next/no-literal-string -- dayjs format pattern, not user text */}
                    {civilDateToDayjs(day.day).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: 'center',
                        color: healthColor(day.health, theme.palette.mode === 'dark'),
                      }}>
                      <HealthIcon health={day.health} />
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {t(healthLabelKey(day.health))}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{full.format(day.snapshots)}</TableCell>
                  <TableCell align="right">{full.format(day.vehicleLocations)}</TableCell>
                  <TableCell align="right">{full.format(day.duplicateIds)}</TableCell>
                  <TableCell align="right">{full.format(day.ridesLinkedToGtfs)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Stack>
  )
}

export const StrideLiteStatusPage = () => {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <Widget title={t('strideLite.title')}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('strideLite.intro')}
        </Typography>
        {/* eslint-disable-next-line i18next/no-literal-string -- repository URL, not user text */}
        <Link href="https://github.com/NoamGaash/stride-lite" target="_blank" rel="noreferrer">
          github.com/NoamGaash/stride-lite
        </Link>
        <Box sx={{ mt: 2 }}>
          <BackendSwitch />
        </Box>
      </Widget>
      {isStrideLiteConfigured() ? (
        <>
          <Widget title={t('strideLite.status_title')}>
            <StatusSection />
          </Widget>
          <Widget title={t('strideLite.coverage_title')}>
            <CoverageSection />
          </Widget>
        </>
      ) : (
        <Alert severity="info">
          <AlertTitle>{t('strideLite.not_configured')}</AlertTitle>
          <Typography variant="body2">{t('strideLite.not_configured_help')}</Typography>
        </Alert>
      )}
    </PageContainer>
  )
}

export default StrideLiteStatusPage
