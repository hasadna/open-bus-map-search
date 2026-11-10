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

/** The experimental backend is still being filled, so an answer it gives today can be
 *  wrong tomorrow, and none of its answers may resurface after switching back. */
export const shouldPersistQueries = (): boolean => !isStrideLiteSelected()

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
    /** Absent from a backend older than the field. */
    cpus: number | null
  } | null
  disks: { name: string; free: number; total: number }[] | null
  tables: { table: string; rows: number; bytes: number }[] | null
  refreshes:
    | {
        view: string
        status: string
        lastSuccessTime: string | null
        lastRefreshTime: string | null
        exception: string
      }[]
    | null
  /** A part's own bytes, by what they are for. Its projections are counted only in `projections`. */
  storageByTable:
    | {
        table: string
        rows: number
        parts: number
        bytes: number
        columns: number
        columnsUncompressed: number
        primaryKey: number
        marks: number
        skipIndexes: number
        projections: number
      }[]
    | null
  projections: { table: string; projection: string; rows: number; bytes: number }[] | null
  skipIndexes:
    | {
        table: string
        name: string
        type: string
        expr: string
        granularity: number
        bytes: number
      }[]
    | null
  columns:
    | {
        table: string
        column: string
        type: string
        codec: string
        compressed: number
        uncompressed: number
      }[]
    | null
  /** Bytes on disk that serve no query: parts awaiting deletion, set-aside parts, other databases. */
  storageNotServed: { kind: string; table: string; parts: number; bytes: number }[] | null
  merges:
    | { table: string; elapsed: number; progress: number; isMutation: boolean; bytes: number }[]
    | null
  mutations: { table: string; command: string; partsToDo: number; isDone: boolean }[] | null
  /** Running queries; the shape has every literal replaced by `?`. */
  processes:
    | {
        kind: string
        elapsed: number
        readRows: number
        memory: number
        internal: boolean
        shape: string
      }[]
    | null
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
          cpus: server.cpus === undefined ? null : asNumber(server.cpus, 'cpus'),
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
      lastRefreshTime: asNullableString(r.last_refresh_time, 'last_refresh_time'),
      exception: asString(r.exception, 'exception'),
    })),
    storageByTable: section(raw.storage_by_table, (r) => ({
      table: asString(r.table, 'table'),
      rows: asNumber(r.rows, 'rows'),
      parts: asNumber(r.parts, 'parts'),
      bytes: asNumber(r.bytes_on_disk, 'bytes_on_disk'),
      columns: asNumber(r.columns_bytes, 'columns_bytes'),
      columnsUncompressed: asNumber(r.columns_uncompressed_bytes, 'columns_uncompressed_bytes'),
      primaryKey: asNumber(r.primary_key_bytes, 'primary_key_bytes'),
      marks: asNumber(r.marks_bytes, 'marks_bytes'),
      skipIndexes: asNumber(r.skip_index_bytes, 'skip_index_bytes'),
      projections: asNumber(r.projection_bytes, 'projection_bytes'),
    })),
    projections: section(raw.projections, (r) => ({
      table: asString(r.table, 'table'),
      projection: asString(r.projection, 'projection'),
      rows: asNumber(r.rows, 'rows'),
      bytes: asNumber(r.bytes_on_disk, 'bytes_on_disk'),
    })),
    skipIndexes: section(raw.skip_indexes, (r) => ({
      table: asString(r.table, 'table'),
      name: asString(r.name, 'name'),
      type: asString(r.type_full, 'type_full'),
      expr: asString(r.expr, 'expr'),
      granularity: asNumber(r.granularity, 'granularity'),
      bytes: asNumber(r.bytes_on_disk, 'bytes_on_disk'),
    })),
    columns: section(raw.columns, (r) => ({
      table: asString(r.table, 'table'),
      column: asString(r.column, 'column'),
      type: asString(r.type, 'type'),
      codec: asString(r.compression_codec, 'compression_codec'),
      compressed: asNumber(r.data_compressed_bytes, 'data_compressed_bytes'),
      uncompressed: asNumber(r.data_uncompressed_bytes, 'data_uncompressed_bytes'),
    })),
    storageNotServed: section(raw.storage_not_served, (r) => ({
      kind: asString(r.kind, 'kind'),
      table: asString(r.table, 'table'),
      parts: asNumber(r.parts, 'parts'),
      bytes: asNumber(r.bytes_on_disk, 'bytes_on_disk'),
    })),
    merges: section(raw.merges, (r) => ({
      table: asString(r.table, 'table'),
      elapsed: asNumber(r.elapsed, 'elapsed'),
      progress: asNumber(r.progress, 'progress'),
      isMutation: r.is_mutation === 1 || r.is_mutation === true,
      bytes: asNumber(r.total_size_bytes_compressed, 'total_size_bytes_compressed'),
    })),
    mutations: section(raw.mutations, (r) => ({
      table: asString(r.table, 'table'),
      command: asString(r.command, 'command'),
      partsToDo: asNumber(r.parts_to_do, 'parts_to_do'),
      isDone: r.is_done === 1 || r.is_done === true,
    })),
    processes: section(raw.processes, (r) => ({
      kind: asString(r.query_kind, 'query_kind'),
      elapsed: asNumber(r.elapsed, 'elapsed'),
      readRows: asNumber(r.read_rows, 'read_rows'),
      memory: asNumber(r.memory_usage, 'memory_usage'),
      internal: r.is_internal === 1 || r.is_internal === true,
      shape: asString(r.query_shape, 'query_shape'),
    })),
    apiRequests: section(raw.api_requests_last_hour, parseRequestRow),
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

export const STRIDE_LITE_REQUEST_WINDOWS = ['hour', 'day', 'week'] as const
export type StrideLiteRequestWindow = (typeof STRIDE_LITE_REQUEST_WINDOWS)[number]

type ApiRequestRow = NonNullable<StrideLiteOpsMetrics['apiRequests']>[number]

/** `GET /ops/requests`. The API keeps requests in memory, so `from` — where that memory
 *  starts — can be later than the window's start, after a restart. */
export type StrideLiteRequests = {
  from: string
  to: string
  buckets: { start: string; requests: number; errors: number; p95: number | null }[]
  rows: ApiRequestRow[]
}

const parseRequestRow = (r: Record<string, unknown>): ApiRequestRow => ({
  path: asString(r.path, 'path'),
  // Older backends send no flag and only ever one non-endpoint row, "other".
  endpoint: r.endpoint === undefined ? r.path !== 'other' : r.endpoint === true,
  requests: asNumber(r.requests, 'requests'),
  errors: asNumber(r.errors, 'errors'),
  p50: asNumber(r.p50_ms, 'p50_ms'),
  p95: asNumber(r.p95_ms, 'p95_ms'),
  max: asNumber(r.max_ms, 'max_ms'),
})

export const strideLiteOpsRequestsQueryOptions = (window: StrideLiteRequestWindow) =>
  queryOptions({
    queryKey: ['strideLite', 'opsRequests', strideLiteApiBasePath(), window],
    queryFn: async (): Promise<StrideLiteRequests> => {
      const raw = asRecord(await fetchJson(`/ops/requests?window=${window}`))
      return {
        from: asString(raw.from, 'from'),
        to: asString(raw.to, 'to'),
        buckets:
          section(raw.buckets, (b) => ({
            start: asString(b.start, 'start'),
            requests: asNumber(b.requests, 'requests'),
            errors: asNumber(b.errors, 'errors'),
            p95: b.p95_ms === null ? null : asNumber(b.p95_ms, 'p95_ms'),
          })) ?? [],
        rows: section(raw.rows, parseRequestRow) ?? [],
      }
    },
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
