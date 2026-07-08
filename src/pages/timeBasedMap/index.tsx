import { CloseRounded, FilterAltRounded, InfoOutlined } from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Popover,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { DateCalendar, DateField, TimeField } from '@mui/x-date-pickers'
import { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import dayjs, { ISRAEL_TIMEZONE, parseIsraelLocalDatetime, toIsraelTimezone } from 'src/dayjs'
import { useAgencyList } from 'src/hooks/useAgencyList'
import useVehicleLocations from 'src/hooks/useVehicleLocations'
import { InitialUrlParamsContext, PageShareParamsContext } from 'src/model/routeContext'
import { type Point, toPoint } from 'src/pages/components/map-related/map-types'
import { BusToolTip } from 'src/pages/components/map-related/MapLayers/BusToolTip'
import { MapShell } from 'src/pages/components/map-related/MapShell'
import { operatorList } from 'src/pages/operator/data'
import { PageContainer } from '../components/PageContainer'
import { ResponsiveDialog } from '../components/ResponsiveDialog'
import { busIcon, busIconPath } from '../components/utils/BusIcon'
import createClusterCustomIcon from '../components/utils/customCluster/customCluster'
import InfoYoutubeModal from '../components/YoutubeModal'

const DEFAULT_TIME = () => toIsraelTimezone(dayjs())
const DEFAULT_POSITION: Point = {
  loc: [32.3057988, 34.85478613],
  color: 0,
}
const START_OF_TIME = dayjs('2023-01-01')
const SPEED_FILTER_MIN = 0
const SPEED_FILTER_MAX = 120

type ServiceType = (typeof operatorList)[number]['type']
type DateTimeTab = 'date' | 'time'

const operatorTypeByRef = new Map<string, ServiceType>(
  operatorList.map((operator) => [operator.ref, operator.type]),
)

const serviceTypeOrder: ServiceType[] = ['bus', 'rail', 'light_rail', 'subway', 'cable_car', 'taxi']
const speedBands = [
  { min: 0, max: 0, key: 'map_speed_stopped' },
  { min: 1, max: 30, key: 'map_speed_local' },
  { min: 31, max: 50, key: 'map_speed_urban' },
  { min: 51, max: 80, key: 'map_speed_interurban' },
  { min: 81, max: 90, key: 'map_speed_divided_interurban' },
  { min: 91, max: 110, key: 'map_speed_highway' },
  { min: 111, max: SPEED_FILTER_MAX, key: 'map_speed_very_fast' },
] as const

function getOperatorType(operatorRef?: number): ServiceType {
  return operatorTypeByRef.get(String(operatorRef)) ?? 'bus'
}

function getSpeedBandKeysFromMin(minSpeed: number) {
  return speedBands.filter((band) => band.max >= minSpeed).map((band) => band.key)
}

function labelWithCount(
  selected: number,
  labels: {
    available: string
    selected: string
  },
) {
  return selected > 0 ? labels.selected : labels.available
}

export default function TimeBasedMapPage() {
  const initialUrlParams = useContext(InitialUrlParamsContext)
  const [from, setFrom] = useState(
    () =>
      (initialUrlParams.datetime && parseIsraelLocalDatetime(initialUrlParams.datetime)) ||
      DEFAULT_TIME(),
  )
  const to = useMemo(() => dayjs(from).add(1, 'minutes'), [from])
  const { locations, isLoading } = useVehicleLocations({ from, to })
  const { t } = useTranslation()
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'))
  const agencyList = useAgencyList()
  const [dateTimeDialogOpen, setDateTimeDialogOpen] = useState(false)
  const [dateTimeTab, setDateTimeTab] = useState<DateTimeTab>('date')
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false)
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceType[]>([])
  const [selectedOperatorRefs, setSelectedOperatorRefs] = useState<number[]>([])
  const [minSpeed, setMinSpeed] = useState(SPEED_FILTER_MIN)

  const operatorNameByRef = useMemo(() => {
    const names = new Map<number, string>()
    agencyList.forEach((agency) => {
      if (agency.operatorRef && agency.agencyName) names.set(agency.operatorRef, agency.agencyName)
    })
    operatorList.forEach((operator) => {
      if (!names.has(Number(operator.ref))) names.set(Number(operator.ref), operator.name)
    })
    return names
  }, [agencyList])

  const availableServiceTypes = useMemo(
    () =>
      serviceTypeOrder.filter((type) =>
        locations.some((location) => getOperatorType(location.siriRouteOperatorRef) === type),
      ),
    [locations],
  )

  const serviceTypeOptions = useMemo(
    () =>
      serviceTypeOrder
        .filter(
          (type) => availableServiceTypes.includes(type) || selectedServiceTypes.includes(type),
        )
        .map((type) => ({
          type,
          label: t(`operator.type.${type}`),
        })),
    [availableServiceTypes, selectedServiceTypes, t],
  )

  const availableOperators = useMemo(() => {
    const refs = Array.from(
      new Set(locations.map((location) => location.siriRouteOperatorRef).filter(Boolean)),
    ) as number[]
    return refs
      .sort((a, b) => {
        const aName = operatorNameByRef.get(a) ?? String(a)
        const bName = operatorNameByRef.get(b) ?? String(b)
        return aName.localeCompare(bName)
      })
      .map((ref) => ({
        ref,
        label: operatorNameByRef.get(ref) ?? String(ref),
      }))
  }, [locations, operatorNameByRef])

  const operatorOptions = useMemo(() => {
    const optionByRef = new Map(availableOperators.map((operator) => [operator.ref, operator]))
    selectedOperatorRefs.forEach((ref) => {
      if (!optionByRef.has(ref))
        optionByRef.set(ref, { ref, label: operatorNameByRef.get(ref) ?? String(ref) })
    })
    return Array.from(optionByRef.values())
  }, [availableOperators, operatorNameByRef, selectedOperatorRefs])

  const filteredLocations = useMemo(
    () =>
      locations.filter((location) => {
        const operatorRef = location.siriRouteOperatorRef
        if (
          selectedServiceTypes.length > 0 &&
          !selectedServiceTypes.includes(getOperatorType(operatorRef))
        ) {
          return false
        }
        if (
          selectedOperatorRefs.length > 0 &&
          (!operatorRef || !selectedOperatorRefs.includes(operatorRef))
        ) {
          return false
        }
        if (minSpeed > SPEED_FILTER_MIN && (location.velocity ?? 0) < minSpeed) return false
        return true
      }),
    [locations, minSpeed, selectedOperatorRefs, selectedServiceTypes],
  )

  const positions = useMemo(() => filteredLocations.map(toPoint), [filteredLocations])

  const handleOpenDate = useCallback(() => {
    setDateTimeTab('date')
    setDateTimeDialogOpen(true)
  }, [])

  const handleOpenTime = useCallback(() => {
    setDateTimeTab('time')
    setDateTimeDialogOpen(true)
  }, [])

  const handleDateChange = useCallback((date: dayjs.Dayjs | null) => {
    if (!date?.isValid()) return
    setFrom((current) => current.year(date.year()).month(date.month()).date(date.date()))
  }, [])

  const handleTimeChange = useCallback((time: dayjs.Dayjs | null) => {
    if (!time?.isValid()) return
    setFrom((current) => current.hour(time.hour()).minute(time.minute()).second(0).millisecond(0))
  }, [])

  const selectedOperators = useMemo(
    () =>
      selectedOperatorRefs.map((ref) => ({
        ref,
        label: operatorNameByRef.get(ref) ?? String(ref),
      })),
    [operatorNameByRef, selectedOperatorRefs],
  )

  const selectedServiceTypeOptions = useMemo(
    () =>
      selectedServiceTypes.map((type) => ({
        type,
        label: t(`operator.type.${type}`),
      })),
    [selectedServiceTypes, t],
  )

  const clearFilters = useCallback(() => {
    setSelectedServiceTypes([])
    setSelectedOperatorRefs([])
    setMinSpeed(SPEED_FILTER_MIN)
  }, [])

  const speedFilterEnabled = minSpeed > SPEED_FILTER_MIN

  const activeFilterCount =
    (selectedServiceTypes.length > 0 ? 1 : 0) +
    (selectedOperatorRefs.length > 0 ? 1 : 0) +
    (speedFilterEnabled ? 1 : 0)

  const allOptionalFiltersActive =
    selectedServiceTypes.length > 0 && selectedOperatorRefs.length > 0 && speedFilterEnabled

  // LEGACY: manual share-param injection — replace with usePageState's per-page
  // persistent `params` when this page is migrated.
  const { setParams } = useContext(PageShareParamsContext)
  useEffect(() => {
    // Shared as a readable Israel-local datetime, e.g. 2023-03-14T17:00
    setParams({ datetime: from.tz(ISRAEL_TIMEZONE).format('YYYY-MM-DDTHH:mm') })
    return () => setParams({})
  }, [from, setParams])

  return (
    <PageContainer className="map-container">
      <Typography variant="h4" className="page-title">
        {t('time_based_map_page_title')}
        <InfoYoutubeModal
          label={t('open_video_about_this_page')}
          title={t('youtube_modal_info_title')}
          videoUrl="https://www.youtube-nocookie.com/embed/bXg50_j_hTA?si=t8PiTrTA1budRZg-&amp;start=150"
        />
      </Typography>
      <Alert severity="info" variant="outlined" icon={false} sx={{ mb: 2 }}>
        {t('time_based_map_page_description')}
      </Alert>
      {isCompact && (
        <div className="map-above-count">
          <LocationCountBadge
            filteredCount={filteredLocations.length}
            isLoading={isLoading}
            plain
            totalCount={locations.length}
          />
        </div>
      )}
      <MapShell
        center={DEFAULT_POSITION.loc}
        zoom={8}
        scrollWheelZoom={true}
        controls={
          <MapFilterControls
            activeFilterCount={activeFilterCount}
            allOptionalFiltersActive={allOptionalFiltersActive}
            filteredCount={filteredLocations.length}
            from={from}
            isCompact={isCompact}
            isLoading={isLoading}
            minSpeed={minSpeed}
            onClearOperators={() => setSelectedOperatorRefs([])}
            onClearServiceTypes={() => setSelectedServiceTypes([])}
            onClearSpeed={() => setMinSpeed(SPEED_FILTER_MIN)}
            onDateChange={handleDateChange}
            onOpenDate={handleOpenDate}
            onOpenFilters={() => setFiltersDialogOpen(true)}
            onOpenTime={handleOpenTime}
            onTimeChange={handleTimeChange}
            selectedOperatorCount={selectedOperatorRefs.length}
            selectedOperatorLabels={selectedOperators.map((operator) => operator.label)}
            selectedServiceTypeLabels={selectedServiceTypeOptions.map((option) => option.label)}
            selectedServiceTypes={selectedServiceTypes}
            speedFilterEnabled={speedFilterEnabled}
            totalCount={locations.length}
          />
        }>
        <TileLayer
          attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        <Markers positions={positions} />
      </MapShell>
      {isCompact && (
        <ResponsiveDialog
          open={dateTimeDialogOpen}
          onClose={() => setDateTimeDialogOpen(false)}
          slotProps={{ paper: { className: 'map-datetime-paper' } }}
          dialogProps={{
            fullWidth: false,
            maxWidth: false,
          }}>
          <DialogTitle className="map-filter-dialog-title">
            {t('map_date_time')}
            <IconButton onClick={() => setDateTimeDialogOpen(false)} size="small">
              <CloseRounded />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Tabs
              value={dateTimeTab}
              onChange={(_, value: DateTimeTab) => setDateTimeTab(value)}
              variant="fullWidth"
              sx={{ mb: 2 }}>
              <Tab value="date" label={t('choose_date')} />
              <Tab value="time" label={t('choose_time')} />
            </Tabs>
            {dateTimeTab === 'date' ? (
              <MapDateCalendar value={from} onChange={handleDateChange} />
            ) : (
              <MobileTimeInput value={from} onChange={handleTimeChange} />
            )}
          </DialogContent>
        </ResponsiveDialog>
      )}
      <ResponsiveDialog open={filtersDialogOpen} onClose={() => setFiltersDialogOpen(false)}>
        <DialogTitle className="map-filter-dialog-title">
          {t('map_filter')}
          <IconButton onClick={() => setFiltersDialogOpen(false)} size="small">
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack className="map-filter-fields" spacing={3}>
            <Autocomplete
              multiple
              options={serviceTypeOptions}
              value={selectedServiceTypeOptions}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.type === value.type}
              onChange={(_, value) => setSelectedServiceTypes(value.map((option) => option.type))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={labelWithCount(selectedServiceTypes.length, {
                    available: t('map_filter_count_available', {
                      label: t('map_service_type'),
                      available: availableServiceTypes.length,
                    }),
                    selected: t('map_filter_count_selected', {
                      label: t('map_service_type'),
                      selected: selectedServiceTypes.length,
                      available: availableServiceTypes.length,
                    }),
                  })}
                />
              )}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox checked={selected} sx={{ me: 1 }} />
                  {option.label}
                </li>
              )}
            />
            <Autocomplete
              multiple
              options={operatorOptions}
              value={selectedOperators}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.ref === value.ref}
              onChange={(_, value) =>
                setSelectedOperatorRefs(value.map((operator) => operator.ref))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={labelWithCount(selectedOperatorRefs.length, {
                    available: t('map_filter_count_available', {
                      label: t('map_operator'),
                      available: availableOperators.length,
                    }),
                    selected: t('map_filter_count_selected', {
                      label: t('map_operator'),
                      selected: selectedOperatorRefs.length,
                      available: availableOperators.length,
                    }),
                  })}
                />
              )}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox checked={selected} sx={{ me: 1 }} />
                  {option.label}
                </li>
              )}
            />
            <Box className={speedFilterEnabled ? 'map-speed-filter-active' : undefined}>
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle2">{t('map_speed_filter')}</Typography>
                  <Tooltip title={t('map_speed_filter_info')}>
                    <InfoOutlined className="map-filter-info-icon" fontSize="small" />
                  </Tooltip>
                </Stack>
              </Stack>
              <div className="map-speed-filter-body">
                <div className="map-speed-summary">
                  <span className="map-speed-value">
                    <strong>{minSpeed}</strong>
                    <span>{t('kmh')}</span>
                  </span>
                  {speedFilterEnabled && (
                    <span className="map-speed-band-group">
                      <span className="map-speed-band-list">
                        {getSpeedBandKeysFromMin(minSpeed)
                          .map((key) => t(key))
                          .join(', ')}
                      </span>
                    </span>
                  )}
                </div>
                <div className="map-speed-slider-frame">
                  <Slider
                    min={0}
                    max={SPEED_FILTER_MAX}
                    step={5}
                    value={minSpeed}
                    valueLabelDisplay="auto"
                    onChange={(_, value) => setMinSpeed(Array.isArray(value) ? value[0] : value)}
                  />
                  <div className="map-speed-range">
                    <span>{SPEED_FILTER_MIN}</span>
                    <span>{SPEED_FILTER_MAX}</span>
                  </div>
                </div>
              </div>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={clearFilters}>
            {t('map_clear_filters')}
          </Button>
        </DialogActions>
      </ResponsiveDialog>
    </PageContainer>
  )
}

function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits
}

function parseTimeInput(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return { hours, minutes }
}

function MobileTimeInput({
  value,
  onChange,
}: {
  value: dayjs.Dayjs
  onChange: (time: dayjs.Dayjs | null) => void
}) {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState(value.format('HH:mm'))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(value.format('HH:mm'))
  }, [value])

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const selectInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.select())
  }, [])

  const commitValue = useCallback(
    (nextValue: string) => {
      const parsed = parseTimeInput(nextValue)
      if (!parsed) return false
      onChange(value.hour(parsed.hours).minute(parsed.minutes).second(0).millisecond(0))
      return true
    },
    [onChange, value],
  )

  return (
    <div className="map-mobile-time-editor">
      <input
        ref={inputRef}
        aria-label={t('choose_time')}
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onClick={selectInput}
        onChange={(event) => {
          const nextValue = formatTimeInput(event.target.value)
          setInputValue(nextValue)
          if (nextValue.length === 5) commitValue(nextValue)
        }}
        onFocus={selectInput}
        onBlur={() => {
          if (!commitValue(inputValue)) setInputValue(value.format('HH:mm'))
        }}
      />
    </div>
  )
}

function MapDateCalendar({
  value,
  onChange,
}: {
  value: dayjs.Dayjs
  onChange: (date: dayjs.Dayjs | null) => void
}) {
  return (
    <DateCalendar
      value={value}
      onChange={onChange}
      disableFuture
      minDate={START_OF_TIME}
      sx={{ mx: 'auto' }}
      slotProps={{
        calendarHeader: {
          sx: {
            '.MuiPickersCalendarHeader-labelContainer': {
              margin: '0',
              marginInlineEnd: 'auto',
            },
          },
        },
      }}
    />
  )
}

function DesktopDateControl({
  value,
  onChange,
}: {
  value: dayjs.Dayjs
  onChange: (date: dayjs.Dayjs | null) => void
}) {
  const { i18n } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const horizontalOrigin = i18n.dir() === 'rtl' ? 'right' : 'left'

  const commitValue = useCallback(
    (date: dayjs.Dayjs | null) => {
      onChange(date)
      if (date?.isValid()) setAnchorEl(null)
    },
    [onChange],
  )

  return (
    <>
      <DateField
        className="map-control-field"
        value={value}
        onChange={onChange}
        onFocus={(event) => setAnchorEl(event.currentTarget)}
        format="DD/MM/YYYY"
        disableFuture
        minDate={START_OF_TIME}
        variant="standard"
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        disableAutoFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: horizontalOrigin }}
        transformOrigin={{ vertical: 'top', horizontal: horizontalOrigin }}
        slotProps={{ paper: { sx: { borderRadius: 2, translate: '0 10px' } } }}>
        <MapDateCalendar value={value} onChange={commitValue} />
      </Popover>
    </>
  )
}

function DesktopTimeControl({
  value,
  onChange,
}: {
  value: dayjs.Dayjs
  onChange: (time: dayjs.Dayjs | null) => void
}) {
  return (
    <TimeField
      className="map-control-field map-control-time-field"
      value={value}
      onChange={onChange}
      ampm={false}
      format="HH:mm"
      variant="standard"
    />
  )
}

function MapFilterControls({
  activeFilterCount,
  allOptionalFiltersActive,
  filteredCount,
  from,
  isCompact,
  isLoading,
  minSpeed,
  onClearOperators,
  onClearServiceTypes,
  onClearSpeed,
  onDateChange,
  onOpenDate,
  onOpenFilters,
  onOpenTime,
  onTimeChange,
  selectedOperatorCount,
  selectedOperatorLabels,
  selectedServiceTypeLabels,
  selectedServiceTypes,
  speedFilterEnabled,
  totalCount,
}: {
  activeFilterCount: number
  allOptionalFiltersActive: boolean
  filteredCount: number
  from: dayjs.Dayjs
  isCompact: boolean
  isLoading: boolean
  minSpeed: number
  onClearOperators: () => void
  onClearServiceTypes: () => void
  onClearSpeed: () => void
  onDateChange: (date: dayjs.Dayjs | null) => void
  onOpenDate: () => void
  onOpenFilters: () => void
  onOpenTime: () => void
  onTimeChange: (time: dayjs.Dayjs | null) => void
  selectedOperatorCount: number
  selectedOperatorLabels: string[]
  selectedServiceTypeLabels: string[]
  selectedServiceTypes: ServiceType[]
  speedFilterEnabled: boolean
  totalCount: number
}) {
  const { t } = useTranslation()
  const serviceLabel =
    selectedServiceTypes.length === 1
      ? t(`operator.type.${selectedServiceTypes[0]}`)
      : t('map_service_type')
  const showFilterTags = !isCompact
  const showFiltersButton = isCompact || !allOptionalFiltersActive

  return (
    <div className="map-control-stack">
      <div className="map-filter-row">
        {isCompact ? (
          <div className="map-datetime-split">
            <button type="button" className="map-control-badge" onClick={onOpenDate}>
              {from.format('DD/MM/YYYY')}
            </button>
            <button type="button" className="map-control-badge" onClick={onOpenTime}>
              {from.format('HH:mm')}
            </button>
          </div>
        ) : (
          <>
            <DesktopDateControl value={from} onChange={onDateChange} />
            <DesktopTimeControl value={from} onChange={onTimeChange} />
          </>
        )}
        {showFilterTags && selectedServiceTypes.length > 0 && (
          <DismissibleMapBadge
            onClear={onClearServiceTypes}
            tooltip={selectedServiceTypeLabels.join(', ')}>
            {selectedServiceTypes.length === 1
              ? serviceLabel
              : `${serviceLabel} (${selectedServiceTypes.length})`}
          </DismissibleMapBadge>
        )}
        {showFilterTags && selectedOperatorCount > 0 && (
          <DismissibleMapBadge
            onClear={onClearOperators}
            tooltip={selectedOperatorLabels.join(', ')}>
            {t('map_operator')} ({selectedOperatorCount})
          </DismissibleMapBadge>
        )}
        {showFilterTags && speedFilterEnabled && (
          <DismissibleMapBadge onClear={onClearSpeed}>
            {t('map_min_speed', { speed: minSpeed })}
          </DismissibleMapBadge>
        )}
        {showFiltersButton && (
          <button
            type="button"
            className="map-control-badge map-filters-button"
            onClick={onOpenFilters}
            aria-label={t('map_filters')}>
            {isCompact ? (
              <>
                <FilterAltRounded fontSize="small" />
                <span>{activeFilterCount}</span>
              </>
            ) : (
              <>
                <FilterAltRounded fontSize="small" />
                <span>{t('map_filters_add')}</span>
              </>
            )}
          </button>
        )}
      </div>
      {!isCompact && (
        <LocationCountBadge
          filteredCount={filteredCount}
          isLoading={isLoading}
          totalCount={totalCount}
        />
      )}
    </div>
  )
}

function LocationCountBadge({
  filteredCount,
  isLoading,
  plain = false,
  totalCount,
}: {
  filteredCount: number
  isLoading: boolean
  plain?: boolean
  totalCount: number
}) {
  const { t } = useTranslation()

  return (
    <div className={plain ? 'map-location-count-text' : 'map-count-badge'}>
      {isLoading && <CircularProgress size={14} />}
      {filteredCount === 0
        ? t('map_no_matching_locations')
        : t('map_filters_showing', { filtered: filteredCount, total: totalCount })}
    </div>
  )
}

function DismissibleMapBadge({
  children,
  onClear,
  tooltip,
}: {
  children: ReactNode
  onClear: () => void
  tooltip?: string
}) {
  const { t } = useTranslation()

  return (
    <span className="map-control-badge map-control-badge-dismissible" title={tooltip}>
      <span>{children}</span>
      <button type="button" aria-label={t('map_clear_filter')} onClick={onClear}>
        ×
      </button>
    </span>
  )
}

function Markers({ positions }: { positions: Point[] }) {
  const map = useMap()
  const agencyList = useAgencyList()
  const operatorNames = useMemo(
    () =>
      agencyList.reduce<Record<number, string>>((names, agency) => {
        if (agency.operatorRef && agency.agencyName) {
          names[agency.operatorRef] = agency.agencyName
        }
        return names
      }, {}),
    [agencyList],
  )

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      map.flyTo([position.coords.latitude, position.coords.longitude], 13)
    })
  }, [map])

  const markerNodes = useMemo(
    () =>
      positions.map((pos, index) => {
        const operatorId = pos.operator?.toString() || 'default'
        const icon = busIcon({
          operator_id: operatorId,
          name: pos.operator ? operatorNames[pos.operator] : undefined,
        })

        return (
          <Marker position={pos.loc} icon={icon} key={pos.point?.id ?? `${operatorId}-${index}`}>
            <Popup minWidth={300} maxWidth={700}>
              <BusToolTip position={pos} icon={busIconPath(operatorId)} />
            </Popup>
          </Marker>
        )
      }),
    [operatorNames, positions],
  )

  return (
    <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
      {markerNodes}
    </MarkerClusterGroup>
  )
}
