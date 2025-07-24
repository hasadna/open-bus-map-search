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
const LIMIT = 10000
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

  constructor(params: SiriVehicleRequest) {
    this.loadData(params)
  }

  private async loadData(params: SiriVehicleRequest) {
    let offset = 0
    while (this.loading) {
      const response = await fetchWithQueue({
        recordedAtTimeFrom: params.from.toDate(),
        recordedAtTimeTo: params.to.toDate(),
        siriRoutesLineRef: params.lineRef,
        siriRoutesOperatorRef: params.lineRef,
        siriVehicleLocationIds: params.lineRef,
        latGreaterOrEqual: params.latMin,
        latLowerOrEqual: params.latMax,
        lonGreaterOrEqual: params.lonMin,
        lonLowerOrEqual: params.lonMax,
        limit: LIMIT,
        offset,
      })

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

const pool = new Array(CONCURRENCY)
  .fill(0)
  .map(() => Promise.resolve<void | SiriVehicleLocationWithRelatedPydanticModel[]>(void 0))

async function fetchWithQueue(data: SiriVehicleLocationsListGetRequest) {
  const task = async () => {
    for (let attempt = 0; attempt <= RETRY; attempt++) {
      try {
        return await SIRI_API.siriVehicleLocationsListGet(data)
      } catch {
        if (attempt === RETRY) throw new Error(`Failed after ${RETRY} attempts`)
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)))
      }
    }
  }

  const queued = pool
    .shift()!
    .then(task)
    .finally(() => pool.push(Promise.resolve()))

  pool.push(queued)
  return queued
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
    from.format('YYYY-MM-DD'),
    to.format('YYYY-MM-DD'),
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
  onUpdate,
  ...params
}: SiriVehicleRequest & {
  onUpdate: (locations: SiriVehicleLocationWithRelatedPydanticModel[] | { finished: true }) => void // the observer will be called every time with all the locations that were loaded
}) {
  const key = getQueryKey(params)

  if (!loadedLocations.has(key)) {
    loadedLocations.set(key, new LocationObservable(params))
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

    // setLocations([])

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
                [...prev, ...data].sort((a, b) => a.id! - b.id!),
                (loc) => loc.id,
              ),
            )
          }
        },
      }),
    )
    return () => {
      // setLocations([])
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
