/**
 * stride-lite — the experimental ClickHouse-backed reimplementation of the Stride API
 * (https://github.com/NoamGaash/stride-lite).
 *
 * Opting in is two independent gates: the deployment has to configure a URL
 * (`VITE_STRIDE_LITE_API`, unset by default), and the visitor has to flip the switch on
 * the status page. With either gate closed the app talks to production Stride exactly as
 * before.
 */
import { queryOptions } from '@tanstack/react-query'
import { type CivilDate, civilDate } from 'src/model/time/civilDate'

export const strideLiteApiBasePath = (): string =>
  (import.meta.env.VITE_STRIDE_LITE_API ?? '').replace(/\/$/, '')

const OPT_IN_STORAGE_KEY = 'strideLiteEnabled'

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
    throw new Error('stride-lite returned a value that is not an object')
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
    throw new Error('VITE_STRIDE_LITE_API is not configured')
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
