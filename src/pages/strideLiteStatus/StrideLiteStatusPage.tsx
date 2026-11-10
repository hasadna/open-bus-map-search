import {
  Alert,
  AlertTitle,
  Box,
  Button,
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
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { applyStrideApiBasePath } from 'src/api/apiConfig'
import {
  isStrideLiteConfigured,
  isStrideLiteOptedIn,
  setStrideLiteOptedIn,
  strideLiteApiBasePath,
  strideLiteCoverageQueryOptions,
  strideLiteStatusQueryOptions,
} from 'src/api/strideLite'
import { type CivilDate, civilDateToDayjs } from 'src/model/time/civilDate'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import Widget from 'src/shared/Widget'
import { CivilDateSelector } from '../components/CivilDateSelector'
import { PageContainer } from '../components/PageContainer'
import { ActivitySection } from './ActivitySection'
import { CoverageChart } from './CoverageChart'
import {
  expectedSnapshots,
  expectedVehicleLocations,
  isFault,
  selectDayRange,
  withHealthOldestFirst,
} from './coverageHealth'
import { healthColor, HealthIcon, healthLabelKey, useHealthReasonText } from './healthDisplay'
import { LogsSection, NodeSection } from './OpsSection'
import { RefreshBar } from './RefreshBar'
import { RequestsSection } from './RequestsSection'
import { StatTile, Unreachable } from './statusParts'
import { StorageSection } from './StorageSection'

/** Everything the backend has: one row per day, so even years of it stay small, and a range
 *  picked here is a filter rather than a new request. */
const COVERAGE_LIMIT = 10_000

const BackendSwitch = ({ onConfigurationChange }: { onConfigurationChange: () => void }) => {
  const { t } = useTranslation()
  const [basePath, setBasePath] = useState(strideLiteApiBasePath())
  const [urlError, setUrlError] = useState(false)
  const queryClient = useQueryClient()

  const saveBasePath = () => {
    const value = basePath.trim()
    if (value) {
      try {
        const url = new URL(value)
        if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash) {
          throw new TypeError('Invalid API base URL')
        }
      } catch {
        setUrlError(true)
        return
      }
    }
    applyStrideApiBasePath(value)
    setBasePath(strideLiteApiBasePath())
    onConfigurationChange()
    void queryClient.resetQueries()
  }

  return (
    <Stack spacing={1}>
      <TextField
        label={t('strideLite.api_base_url_label')}
        placeholder={t('strideLite.api_base_url_placeholder')}
        value={basePath}
        onChange={(event) => {
          setBasePath(event.target.value)
          setUrlError(false)
        }}
        error={urlError}
        helperText={
          urlError ? t('strideLite.invalid_api_base_url') : t('strideLite.api_base_url_help')
        }
        size="small"
        fullWidth
      />
      <Button
        variant="outlined"
        onClick={saveBasePath}
        disabled={basePath.trim() === strideLiteApiBasePath()}>
        {t('strideLite.save_api_base_url')}
      </Button>
      <FormControlLabel
        control={
          <Switch
            checked={isStrideLiteOptedIn()}
            disabled={!isStrideLiteConfigured()}
            onChange={(event) => {
              setStrideLiteOptedIn(event.target.checked)
              applyStrideApiBasePath()
              onConfigurationChange()
              void queryClient.resetQueries()
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
  const { data, error, isLoading } = useQuery(strideLiteCoverageQueryOptions(COVERAGE_LIMIT))
  const full = new Intl.NumberFormat(i18n.language)
  const reasonText = useHealthReasonText()
  const [chosen, setChosen] = useState<{ from?: CivilDate; to?: CivilDate }>({})

  if (error) return <Unreachable error={error} />
  if (isLoading || !data) return <SkeletonLoader />

  const { from, to, oldest, newest, days } = selectDayRange(withHealthOldestFirst(data), chosen)
  const faults = days.filter((day) => isFault(day.health)).reverse()

  return (
    <Stack spacing={3}>
      {from && to && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <CivilDateSelector
            value={from}
            minDate={oldest}
            maxDate={to}
            customLabel={t('start')}
            onChange={(date) => date && setChosen({ from: date, to })}
          />
          <CivilDateSelector
            value={to}
            minDate={from}
            maxDate={newest}
            customLabel={t('end')}
            onChange={(date) => date && setChosen({ from, to: date })}
          />
        </Stack>
      )}
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
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {reasonText(day.reason)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{full.format(day.snapshots)}</TableCell>
                  <TableCell align="right">{full.format(day.vehicleLocations)}</TableCell>
                  <TableCell align="right">{full.format(day.duplicateIds)}</TableCell>
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
  const [, setConfigurationVersion] = useState(0)
  const onConfigurationChange = () => setConfigurationVersion((version) => version + 1)
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
          <BackendSwitch onConfigurationChange={onConfigurationChange} />
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
          <RefreshBar />
          <Widget title={t('strideLite.node_title')}>
            <NodeSection />
          </Widget>
          <Widget title={t('strideLite.activity_title')}>
            <ActivitySection />
          </Widget>
          <Widget title={t('strideLite.storage_title')}>
            <StorageSection />
          </Widget>
          <Widget title={t('strideLite.api_requests_title')}>
            <RequestsSection />
          </Widget>
          <Widget title={t('strideLite.logs_title')}>
            <LogsSection />
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
