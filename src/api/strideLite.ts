/**
 * stride-lite — the experimental ClickHouse-backed reimplementation of the Stride API
 * (https://github.com/NoamGaash/stride-lite).
 *
 * The experimental URL can be supplied at build time (`VITE_STRIDE_LITE_API`) or
 * overridden per browser from the hidden status page. The visitor must also flip the
 * opt-in switch before Stride requests use it. With the switch off, production is used.
 */
import { queryOptions } from '@tanstack/react-query'
import { type CivilDate, civilDate } from 'src/model/time/civilDate'

const API_BASE_PATH_STORAGE_KEY = 'strideLiteApiBasePath'
const OPT_IN_STORAGE_KEY = 'strideLiteEnabled'

const removeTrailingSlashes = (value: string): string => {
  let end = value.length
  while (end > 0 && value.charCodeAt(end - 1) === 47) end--
  return value.slice(0, end)
}

const buildTimeStrideLiteApiBasePath = (): string =>
  removeTrailingSlashes(import.meta.env.VITE_STRIDE_LITE_API ?? '')

/** Runtime override, if set, takes precedence over the build-time default. */
export const strideLiteApiBasePath = (): string => {
  try {
    const runtimeOverride = localStorage.getItem(API_BASE_PATH_STORAGE_KEY)
    if (runtimeOverride !== null) return runtimeOverride
  } catch {
    // Storage can be unavailable; fall back to the build-time configuration.
  }
  return buildTimeStrideLiteApiBasePath()
}

/** An empty value removes the override and restores the build-time default. */
export const setStrideLiteApiBasePath = (basePath: string): void => {
  const normalized = removeTrailingSlashes(basePath.trim())
  if (normalized) localStorage.setItem(API_BASE_PATH_STORAGE_KEY, normalized)
  else localStorage.removeItem(API_BASE_PATH_STORAGE_KEY)
}

export const isStrideLiteConfigured = (): boolean => strideLiteApiBasePath() !== ''

export const isStrideLiteOptedIn = (): boolean => {
  try {
    return localStorage.getItem(OPT_IN_STORAGE_KEY) === 'true'
  } catch {
    // Storage can throw (Safari private mode, a blocked third-party context); an
    // experimental backend is not worth breaking the app's boot over.
    return false
  }
}

export const isStrideLiteSelected = (): boolean => isStrideLiteConfigured() && isStrideLiteOptedIn()

export const setStrideLiteOptedIn = (optedIn: boolean): void => {
  localStorage.setItem(OPT_IN_STORAGE_KEY, String(optedIn))
}

/** Which Stride base path the api-client should be built against. */
export const strideApiBasePath = (): string =>
  isStrideLiteSelected() ? strideLiteApiBasePath() : (process.env.VITE_STRIDE_API ?? '')

/** `GET /status` — stride-lite only; production Stride has no equivalent. */
export type StrideLiteStatus = {
  /** An archive path, `YYYY/MM/DD/HH/mm`, not a timestamp from the data: 0.32% of the
   *  ministry's `recorded_at_time` values are in the future, so their maximum answers 2038. */
  newestSnapshot: string
  vehicleLocations: number
  newestGtfsDate: CivilDate | null
  refreshTasks: number
  refreshTasksFailing: number
}

/** One day of `GET /coverage`. */
export type StrideLiteCoverageDay = {
  day: CivilDate
  snapshots: number
  vehicleLocations: number
  duplicateIds: number
  rides: number
  ridesWithDuration: number
  ridesLinkedToGtfs: number
  measuredAt: string | null
}

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('stride-lite returned a value that is not an object')
  }
  return value as Record<string, unknown>
}

const asNumber = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`stride-lite returned a non-numeric "${field}"`)
  }
  return value
}

const asString = (value: unknown, field: string): string => {
  if (typeof value !== 'string') throw new Error(`stride-lite returned a non-string "${field}"`)
  return value
}

const asNullableString = (value: unknown, field: string): string | null =>
  value === null || value === undefined ? null : asString(value, field)

const parseStatus = (payload: unknown): StrideLiteStatus => {
  const raw = asRecord(payload)
  const newestGtfsDate = asNullableString(raw.newest_gtfs_date, 'newest_gtfs_date')
  return {
    newestSnapshot: asString(raw.newest_snapshot, 'newest_snapshot'),
    vehicleLocations: asNumber(raw.vehicle_locations, 'vehicle_locations'),
    newestGtfsDate: newestGtfsDate ? civilDate(newestGtfsDate.slice(0, 10)) : null,
    refreshTasks: asNumber(raw.refresh_tasks, 'refresh_tasks'),
    refreshTasksFailing: asNumber(raw.refresh_tasks_failing, 'refresh_tasks_failing'),
  }
}

const parseCoverageDay = (payload: unknown): StrideLiteCoverageDay => {
  const raw = asRecord(payload)
  const day = civilDate(asString(raw.day, 'day').slice(0, 10))
  if (!day) throw new Error(`stride-lite returned an unparsable "day": ${String(raw.day)}`)
  return {
    day,
    snapshots: asNumber(raw.snapshots, 'snapshots'),
    vehicleLocations: asNumber(raw.vehicle_locations, 'vehicle_locations'),
    duplicateIds: asNumber(raw.duplicate_ids, 'duplicate_ids'),
    rides: asNumber(raw.rides, 'rides'),
    ridesWithDuration: asNumber(raw.rides_with_duration, 'rides_with_duration'),
    ridesLinkedToGtfs: asNumber(raw.rides_linked_to_gtfs, 'rides_linked_to_gtfs'),
    measuredAt: asNullableString(raw.measured_at, 'measured_at'),
  }
}

const fetchJson = async (path: string): Promise<unknown> => {
  if (!isStrideLiteConfigured()) {
    throw new Error('No experimental API base URL is configured')
  }
  const response = await fetch(`${strideLiteApiBasePath()}${path}`)
  if (!response.ok) {
    throw new Error(`stride-lite ${path} answered ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export const strideLiteStatusQueryOptions = () =>
  queryOptions({
    queryKey: ['strideLite', 'status', strideLiteApiBasePath()],
    queryFn: async () => parseStatus(await fetchJson('/status')),
    retry: false,
    enabled: isStrideLiteConfigured(),
  })

export const strideLiteCoverageQueryOptions = (limit: number) =>
  queryOptions({
    queryKey: ['strideLite', 'coverage', strideLiteApiBasePath(), limit],
    queryFn: async () => {
      const payload = await fetchJson(`/coverage?limit=${limit}`)
      if (!Array.isArray(payload)) throw new Error('stride-lite /coverage did not return an array')
      return payload.map(parseCoverageDay)
    },
    retry: false,
    enabled: isStrideLiteConfigured(),
  })

/** `GET /ops/metrics`. A section the backend could not read arrives as `{ error }` and is
 *  kept as `null`, so one failing system table does not blank the whole panel. */
export type StrideLiteOpsMetrics = {
  measuredAt: string
  server: {
    version: string
    uptimeSeconds: number
    memoryResident: number
    memoryTotal: number
    memoryAvailable: number
    load1: number
    load15: number
  } | null
  disks: { name: string; free: number; total: number }[] | null
  tables: { table: string; rows: number; bytes: number }[] | null
  refreshes:
    { view: string; status: string; lastSuccessTime: string | null; exception: string }[] | null
  apiRequests:
    | {
        path: string
        /** False for a path the API does not serve: a scanner, a typo, a favicon. */
        endpoint: boolean
        requests: number
        errors: number
        p50: number
        p95: number
        max: number
      }[]
    | null
  errors: { name: string; count: number; lastErrorTime: string; message: string }[] | null
}

const section = <T>(value: unknown, parse: (row: Record<string, unknown>) => T): T[] | null =>
  Array.isArray(value) ? value.map((row) => parse(asRecord(row))) : null

const parseOpsMetrics = (payload: unknown): StrideLiteOpsMetrics => {
  const raw = asRecord(payload)
  const server = raw.server && !('error' in asRecord(raw.server)) ? asRecord(raw.server) : undefined
  return {
    measuredAt: asString(raw.measured_at, 'measured_at'),
    server: server
      ? {
          version: asString(server.version, 'version'),
          uptimeSeconds: asNumber(server.uptime_seconds, 'uptime_seconds'),
          memoryResident: asNumber(server.MemoryResident, 'MemoryResident'),
          memoryTotal: asNumber(server.OSMemoryTotal, 'OSMemoryTotal'),
          memoryAvailable: asNumber(server.OSMemoryAvailable, 'OSMemoryAvailable'),
          load1: asNumber(server.LoadAverage1, 'LoadAverage1'),
          load15: asNumber(server.LoadAverage15, 'LoadAverage15'),
        }
      : null,
    disks: section(raw.disks, (r) => ({
      name: asString(r.name, 'name'),
      free: asNumber(r.free_space, 'free_space'),
      total: asNumber(r.total_space, 'total_space'),
    })),
    tables: section(raw.tables, (r) => ({
      table: asString(r.table, 'table'),
      rows: asNumber(r.rows, 'rows'),
      bytes: asNumber(r.bytes_on_disk, 'bytes_on_disk'),
    })),
    refreshes: section(raw.refreshes, (r) => ({
      view: asString(r.view, 'view'),
      status: asString(r.status, 'status'),
      lastSuccessTime: asNullableString(r.last_success_time, 'last_success_time'),
      exception: asString(r.exception, 'exception'),
    })),
    apiRequests: section(raw.api_requests_last_hour, (r) => ({
      path: asString(r.path, 'path'),
      // Older backends send no flag and only ever one non-endpoint row, "other".
      endpoint: r.endpoint === undefined ? r.path !== 'other' : r.endpoint === true,
      requests: asNumber(r.requests, 'requests'),
      errors: asNumber(r.errors, 'errors'),
      p50: asNumber(r.p50_ms, 'p50_ms'),
      p95: asNumber(r.p95_ms, 'p95_ms'),
      max: asNumber(r.max_ms, 'max_ms'),
    })),
    errors: section(raw.errors_last_day, (r) => ({
      name: asString(r.name, 'name'),
      count: asNumber(r.value, 'value'),
      lastErrorTime: asString(r.last_error_time, 'last_error_time'),
      message: asString(r.last_error_message, 'last_error_message'),
    })),
  }
}

/** The backend caches these for 15 s, so polling faster only repeats the same answer. */
const OPS_REFRESH_MS = 30_000

export const strideLiteOpsMetricsQueryOptions = () =>
  queryOptions({
    queryKey: ['strideLite', 'opsMetrics', strideLiteApiBasePath()],
    queryFn: async () => parseOpsMetrics(await fetchJson('/ops/metrics')),
    retry: false,
    refetchInterval: OPS_REFRESH_MS,
    enabled: isStrideLiteConfigured(),
  })

/** The fixed set `/ops/logs` serves; the backend refuses any other. */
export const STRIDE_LITE_LOG_SOURCES = [
  'catchup',
  'gtfs',
  'first-load',
  'clickhouse',
  'api',
] as const
export type StrideLiteLogSource = (typeof STRIDE_LITE_LOG_SOURCES)[number]

export const strideLiteOpsLogsQueryOptions = (source: StrideLiteLogSource, lines: number) =>
  queryOptions({
    queryKey: ['strideLite', 'opsLogs', strideLiteApiBasePath(), source, lines],
    queryFn: async () => {
      const payload = asRecord(await fetchJson(`/ops/logs?source=${source}&lines=${lines}`))
      const entry = asRecord(payload[source])
      if ('error' in entry) return { lines: [], missing: asString(entry.error, 'error') }
      if (!Array.isArray(entry.lines)) throw new Error('stride-lite /ops/logs returned no lines')
      return { lines: entry.lines.map((line) => asString(line, 'line')), missing: null }
    },
    retry: false,
    refetchInterval: OPS_REFRESH_MS,
    enabled: isStrideLiteConfigured(),
  })
