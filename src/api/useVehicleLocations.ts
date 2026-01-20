/**
 * this is a custom hook that fetches the vehicle locations from the API.
 * it recieves an interval of two dates, and loads locations of all vehicles in that interval.
 * if some of the interval has already been loaded,
 */
import type { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import uniqBy from 'lodash.uniqby'
import { useEffect, useState } from 'react'
import dayjs from 'src/dayjs'
import { SIRI_API } from './apiConfig'

const LIMIT = 10000 // the maximum number of vehicles to load in one request

type Dateable = Date | number | string | dayjs.Dayjs

type VehicleLocationQuery = {
  from: Dateable
  to: Dateable
  lineRef?: number
  vehicleRef?: number
  operatorRef?: number
}

function formatTime(time: Dateable) {
  if (dayjs.isDayjs(time)) {
    return time.toISOString()
  } else {
    const date = new Date(time).toISOString()
    return date
  }
}

const loadedLocations = new Map<
  string, // time interval
  LocationObservable
>()

/*
 * this class is an observable that loads the data from the API.
 * it notifies the observers every time new data is loaded.
 * it also caches the data, so if the same interval is requested again, it will not load it again.
 */
class LocationObservable {
  constructor(query: VehicleLocationQuery) {
    this.#loadData(query)
  }

  data: SiriVehicleLocationWithRelatedPydanticModel[] = []
  loading = true

  async #loadData(querys: VehicleLocationQuery) {
    let offset = 0
    for (let i = 1; this.loading; i++) {
      const data = await fetchWithQueue(querys, i, offset)
      if (!data || data.length === 0) {
        this.loading = false
        this.#notifyObservers({ finished: true })
      } else {
        this.data = [...this.data, ...data]
        this.#notifyObservers(data)
        offset += LIMIT * i
      }
    }
    this.#observers = []
  }

  #notifyObservers(data: SiriVehicleLocationWithRelatedPydanticModel[] | { finished: true }) {
    const observers = this.#observers
    // console.log('notifying observers', observers.length)
    observers.forEach((observer) => observer(data))
  }

  #observers: ((
    locations: SiriVehicleLocationWithRelatedPydanticModel[] | { finished: true },
  ) => void)[] = []

  observe(
    observer: (
      locations: SiriVehicleLocationWithRelatedPydanticModel[] | { finished: true },
    ) => void,
  ) {
    if (this.loading) {
      this.#observers.push(observer)
    }
    observer(this.data)
    return () => {
      this.#observers = this.#observers.filter((o) => o !== observer)
    }
  }
}

const pool = new Array(10)
  .fill(0)
  .map(() => Promise.resolve<void | SiriVehicleLocationWithRelatedPydanticModel[]>(void 0))
async function fetchWithQueue(
  { from, to, lineRef, operatorRef, vehicleRef }: VehicleLocationQuery,
  index: number,
  offset: number,
) {
  const task = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await SIRI_API.siriVehicleLocationsListGet({
          recordedAtTimeFrom: dayjs(from).toDate(),
          recordedAtTimeTo: dayjs(to).toDate(),
          limit: LIMIT * index,
          offset,
          siriRoutesOperatorRef: operatorRef?.toString(),
          siriRoutesLineRef: lineRef?.toString(),
          siriRideVehicleRef: vehicleRef?.toString(),
          getCount: false,
        })
      } catch {
        if (attempt === 2) throw new Error(`Failed after 3 attempts`)
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt))
      }
    }
  }

  const queue = pool.shift()!
  const result = queue.then(task).finally(() => pool.push(Promise.resolve()))
  pool.push(result)
  return result
}

// this function checks the cache for the data, and if it's not there, it loads it
function getLocations(
  {
    from,
    to,
    lineRef,
    vehicleRef,
    operatorRef,
    onUpdate,
  }: VehicleLocationQuery & {
    onUpdate: (
      locations: SiriVehicleLocationWithRelatedPydanticModel[] | { finished: true },
    ) => void
  }, // the observer will be called every time with all the locations that were loaded
) {
  const key = `${formatTime(from)}-${formatTime(to)}-${operatorRef}-${lineRef}-${vehicleRef}`
  if (!loadedLocations.has(key)) {
    loadedLocations.set(key, new LocationObservable({ from, to, lineRef, vehicleRef, operatorRef }))
  }
  const observable = loadedLocations.get(key)!
  return observable.observe(onUpdate)
}

function getMinutesInRange(from: Dateable, to: Dateable, gap = 1) {
  const start = dayjs(from).startOf('minute')
  const end = dayjs(to).startOf('minute')

  // array of minutes to load
  const minutes = Array.from({ length: end.diff(start, 'minutes') / gap }, (_, i) => ({
    from: start.add(i * gap, 'minutes'),
    to: start.add((i + 1) * gap, 'minutes'),
  }))
  return minutes
}

export default function useVehicleLocations({
  from,
  to,
  lineRef,
  vehicleRef,
  operatorRef,
  splitMinutes: split = 1,
  pause = false,
}: VehicleLocationQuery & {
  splitMinutes?: false | number
  pause?: boolean
}) {
  const [locations, setLocations] = useState<SiriVehicleLocationWithRelatedPydanticModel[]>([])
  const [isLoading, setIsLoading] = useState<boolean[]>([])
  useEffect(() => {
    if (pause) return
    const range = split ? getMinutesInRange(from, to, split) : [{ from, to }]
    setIsLoading(range.map(() => true))
    const unmounts = range.map(({ from, to }, i) =>
      getLocations({
        from,
        to,
        lineRef,
        vehicleRef,
        operatorRef,
        onUpdate: (data) => {
          if ('finished' in data) {
            setIsLoading((prev) => {
              const newIsLoading = [...prev]
              newIsLoading[i] = false
              return newIsLoading
            })
          } else {
            setLocations((prev) =>
              uniqBy<SiriVehicleLocationWithRelatedPydanticModel>(
                [...prev, ...data].sort((a, b) => (a.id || 0) - (b.id || 0)),
                (loc) => loc.id,
              ),
            )
          }
        },
      }),
    )
    return () => {
      setLocations([])
      unmounts.forEach((unmount) => unmount())
      setIsLoading([])
    }
  }, [from, to, lineRef, vehicleRef, split])
  return {
    locations,
    isLoading: isLoading.some((loading) => loading),
  }
}

export {}
