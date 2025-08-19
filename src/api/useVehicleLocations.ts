/**
 * this is a custom hook that fetches the vehicle locations from the API.
 * it recieves an interval of two dates, and loads locations of all vehicles in that interval.
 * if some of the interval has already been loaded,
 */

import uniqBy from 'lodash.uniqby'
import {
  SiriVehicleLocationsListGetRequest,
  SiriVehicleLocationWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { useThrottledState } from '@tanstack/react-pacer'
import { useEffect, useRef, useState } from 'react'
import { SIRI_API } from './apiConfig'
import dayjs from 'src/dayjs'

export type MapBoundary = {
  latMin: number
  latMax: number
  lonMin: number
  lonMax: number
}

type SiriVehicleRequest = {
  from: number
  to: number
  lineRef?: string
  vehicleRef?: string
  operatorRef?: string
  boundary?: MapBoundary
}

const LIMIT = 1000
const CONCURRENCY = 10
const RETRY = 3

const loadedLocations = new Map<string, LocationObservable>()

/*
 * this class is an observable that loads the data from the API.
 * it notifies the observers every time new data is loaded.
 * it also caches the data, so if the same interval is requested again, it will not load it again.
 */
class LocationObservable {
  data: SiriVehicleLocationWithRelatedPydanticModel[] = []
  loading = true
  observers: ((
    locations: SiriVehicleLocationWithRelatedPydanticModel[] | { finished: true },
  ) => void)[] = []

  constructor(params: SiriVehicleRequest, signal?: AbortSignal) {
    this.loadData(params, signal)
  }

  private async loadData(params: SiriVehicleRequest, signal?: AbortSignal) {
    let i = 0
    while (this.loading) {
      const response = await fetchWithQueue(
        {
          recordedAtTimeFrom: params.from ? new Date(params.from) : undefined,
          recordedAtTimeTo: params.to ? new Date(params.to) : undefined,
          siriRoutesLineRef: params.lineRef,
          siriRoutesOperatorRef: params.operatorRef,
          siriVehicleLocationIds: params.vehicleRef,
          latGreaterOrEqual: params.boundary?.latMin,
          latLowerOrEqual: params.boundary?.latMax,
          lonGreaterOrEqual: params.boundary?.lonMin,
          lonLowerOrEqual: params.boundary?.lonMax,
          limit: LIMIT,
          offset: LIMIT * i++,
        },
        signal,
      )

      const batch = response || []

      if (batch.length === 0) {
        this.loading = false
        this.notifyObservers({ finished: true })
      } else {
        this.data.push(...batch)
        this.notifyObservers(batch)
      }
    }
  }

  private notifyObservers(
    data: SiriVehicleLocationWithRelatedPydanticModel[] | { finished: true },
  ) {
    this.observers.forEach((observer) => observer(data))
  }

  observe(
    observer: (
      locations: SiriVehicleLocationWithRelatedPydanticModel[] | { finished: true },
    ) => void,
  ) {
    if (this.loading) this.observers.push(observer)
    observer(this.data)
    return () => {
      this.observers = this.observers.filter((o) => o !== observer)
    }
  }
}

type QueueTask = {
  fn: () => Promise<void>
  resolve: () => void
  reject: () => void
}

const queue: QueueTask[] = []
let activeCount = 0

async function fetchWithQueue(
  data: SiriVehicleLocationsListGetRequest,
  signal?: AbortSignal,
): Promise<SiriVehicleLocationWithRelatedPydanticModel[] | void> {
  return new Promise((resolve, reject) => {
    const task = async () => {
      for (let attempt = 0; attempt <= RETRY; attempt++) {
        try {
          const result = await SIRI_API.siriVehicleLocationsListGet(data, { signal })
          resolve(result)
          return
        } catch {
          if (attempt === RETRY) {
            reject(new Error(`Failed after ${RETRY} attempts`))
            return
          }
          await new Promise((r) => setTimeout(r, attempt === 0 ? 0 : 1000 * 2 ** (attempt - 1)))
        }
      }
    }

    const queueTask: QueueTask = { fn: task, resolve, reject }

    const runNext = () => {
      if (activeCount < CONCURRENCY && queue.length > 0) {
        const nextTask = queue.shift()
        if (nextTask) {
          activeCount++
          nextTask
            .fn()
            .catch(nextTask.reject)
            .finally(() => {
              activeCount--
              runNext()
            })
        }
      }
    }

    if (activeCount < CONCURRENCY) {
      activeCount++
      task()
        .catch(reject)
        .finally(() => {
          activeCount--
          runNext()
        })
    } else {
      queue.push(queueTask)
    }
  })
}

function getQueryKey(params: Partial<SiriVehicleRequest>) {
  return [...Object.entries(params)]
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, value]) => value)
    .join('-')
}

// this function checks the cache for the data, and if it's not there, it loads it
function getLocations({
  signal,
  onUpdate,
  ...params
}: SiriVehicleRequest & {
  signal?: AbortSignal
  onUpdate: (locations: SiriVehicleLocationWithRelatedPydanticModel[] | { finished: true }) => void // the observer will be called every time with all the locations that were loaded
}) {
  const key = getQueryKey(params)

  if (!loadedLocations.has(key)) {
    loadedLocations.set(key, new LocationObservable(params, signal))
  }
  return loadedLocations.get(key)!.observe(onUpdate)
}

function getMinutesInRange(from: number, to: number, gap = 1) {
  const start = dayjs(from).startOf('minute')
  const end = dayjs(to).startOf('minute')
  const total = end.diff(start, 'minutes')
  const minutes = Array.from({ length: Math.ceil(total / gap) }, (_, i) => ({
    from: start.add(i * gap, 'minutes').valueOf(),
    to: start.add((i + 1) * gap, 'minutes').valueOf(),
  }))
  return minutes
}

function getLocationTiles(boundary: MapBoundary): MapBoundary[] {
  const tiles: ReturnType<typeof getLocationTiles> = []
  const angle = 0.25
  const minLonTile = Math.floor(boundary.lonMin / angle) * angle
  const maxLonTile = Math.ceil(boundary.lonMax / angle) * angle
  const minLatTile = Math.floor(boundary.latMin / angle) * angle
  const maxLatTile = Math.ceil(boundary.latMax / angle) * angle

  for (let lon = minLonTile; lon <= maxLonTile; lon += angle) {
    for (let lat = minLatTile; lat <= maxLatTile; lat += angle) {
      tiles.push({
        latMin: lat,
        latMax: lat + angle,
        lonMin: lon,
        lonMax: lon + 2 * angle,
      })
    }
  }

  return tiles
}

export default function useVehicleLocations({
  splitMinutes: split = 1,
  pause = false,
  from,
  to,
  ...params
}: SiriVehicleRequest & {
  splitMinutes?: false | number
  pause?: boolean
}) {
  const [locations, setLocations] = useThrottledState<
    SiriVehicleLocationWithRelatedPydanticModel[]
  >([], 1000)
  console.log({ locations })
  const [isLoading, setIsLoading] = useState<boolean[]>([])
  const lastQueryKeyRef = useRef('')

  const queryKey = getQueryKey({ from, to, ...params })
  const signal = useRef(new AbortController())
  useEffect(() => {
    if (pause) {
      signal.current.abort()
    } else if (signal.current.signal.aborted) {
      signal.current = new AbortController()
    }

    if (lastQueryKeyRef.current === queryKey) return

    const timeRange = split ? getMinutesInRange(from, to, split) : [{ from, to }]
    let timeAndLocationTiles: (
      | { from: number; to: number }
      | { from: number; to: number; boundary: MapBoundary }
    )[]
    if (params.boundary) {
      const locationTiles = getLocationTiles(params.boundary)
      timeAndLocationTiles = timeRange.flatMap(({ from, to }) =>
        locationTiles.map((boundary) => ({ from, to, boundary })),
      )
    } else {
      timeAndLocationTiles = timeRange
    }

    setIsLoading(timeAndLocationTiles.map(() => true))

    timeAndLocationTiles.forEach((tile, i) => {
      getLocations({
        ...params,
        ...tile,
        signal: signal.current.signal,
        onUpdate: (data) => {
          if ('finished' in data) {
            setIsLoading((prev) => {
              const newIsLoading = [...prev]
              newIsLoading[i] = false
              return newIsLoading
            })
          } else {
            if (data.length > 0) {
              setLocations((prev) => uniqBy([...prev, ...data], (loc) => loc.id))
            }
          }
        },
      })
    })
    return () => {
      setLocations([])
      setIsLoading([])
    }
  }, [queryKey, split, pause])

  return {
    locations,
    isLoading: isLoading.some((loading) => loading),
  }
}
