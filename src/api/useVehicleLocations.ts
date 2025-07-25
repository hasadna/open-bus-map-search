/**
 * this is a custom hook that fetches the vehicle locations from the API.
 * it recieves an interval of two dates, and loads locations of all vehicles in that interval.
 * if some of the interval has already been loaded,
 */

import uniqBy from 'lodash.uniqby'
import {
  SiriApi,
  SiriVehicleLocationsListGetRequest,
  SiriVehicleLocationWithRelatedPydanticModel,
} from 'open-bus-stride-client'
import { useEffect, useRef, useState } from 'react'
import { API_CONFIG } from './apiConfig'
import dayjs from 'src/dayjs'

type SiriVehicleRequest = {
  from: dayjs.Dayjs
  to: dayjs.Dayjs
  lineRef?: string
  vehicleRef?: string
  operatorRef?: string
  latMin?: number
  latMax?: number
  lonMin?: number
  lonMax?: number
}

const SIRI_API = new SiriApi(API_CONFIG)
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
    let offset = 0
    while (this.loading) {
      const response = await fetchWithQueue(
        {
          recordedAtTimeFrom: params.from.toDate(),
          recordedAtTimeTo: params.to.toDate(),
          siriRoutesLineRef: params.lineRef,
          siriRoutesOperatorRef: params.operatorRef,
          siriVehicleLocationIds: params.vehicleRef,
          latGreaterOrEqual: params.latMin,
          latLowerOrEqual: params.latMax,
          lonGreaterOrEqual: params.lonMin,
          lonLowerOrEqual: params.lonMax,
          limit: LIMIT,
          offset,
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
        offset += LIMIT
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

function getQueryKey({
  from,
  to,
  operatorRef,
  lineRef,
  vehicleRef,
  latMax,
  latMin,
  lonMax,
  lonMin,
}: SiriVehicleRequest) {
  return [
    from.toISOString(),
    to.toISOString(),
    operatorRef,
    lineRef,
    vehicleRef,
    latMax,
    latMin,
    lonMax,
    lonMin,
  ].join('-')
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

function getMinutesInRange(from: dayjs.Dayjs, to: dayjs.Dayjs, gap = 1) {
  const start = from.startOf('minute')
  const end = to.startOf('minute')
  const total = end.diff(start, 'minutes')
  const minutes = Array.from({ length: Math.ceil(total / gap) }, (_, i) => ({
    from: start.add(i * gap, 'minutes'),
    to: start.add((i + 1) * gap, 'minutes'),
  }))
  return minutes
}

export default function useVehicleLocations({
  splitMinutes: split = 1,
  pause = false,
  ...params
}: SiriVehicleRequest & {
  splitMinutes?: false | number
  pause?: boolean
}) {
  const [locations, setLocations] = useState<SiriVehicleLocationWithRelatedPydanticModel[]>([])
  const [isLoading, setIsLoading] = useState<boolean[]>([])
  const lastQueryKeyRef = useRef('')

  const queryKey = getQueryKey(params)

  useEffect(() => {
    if (pause) return

    if (lastQueryKeyRef.current === queryKey) return

    const range = split
      ? getMinutesInRange(params.from, params.to, split)
      : [{ from: params.from, to: params.to }]

    setIsLoading(range.map(() => true))

    let unsubscrubed = false
    const unsubscribers: (() => void)[] = []

    range.map(({ from, to }, i) =>
      getLocations({
        ...params,
        from,
        to,
        onUpdate: (data) => {
          if (unsubscrubed) return
          if ('finished' in data) {
            setIsLoading((prev) => {
              const newIsLoading = [...prev]
              newIsLoading[i] = false
              return newIsLoading
            })
          } else {
            setLocations((prev) =>
              uniqBy(
                data.length === 0 ? prev : [...prev, ...data],
                //.sort((a, b) => a.id! - b.id!),
                (loc) => loc.id,
              ),
            )
          }
        },
      }),
    )
    return () => {
      setLocations([])
      unsubscrubed = true
      unsubscribers.forEach((unmount) => unmount())
      setIsLoading([])
    }
  }, [queryKey, split, pause])

  return {
    locations,
    isLoading: isLoading.some((loading) => loading),
  }
}
