/**
 * this is a custom hook that fetches the vehicle locations from the API.
 * it recieves an interval of two dates, and loads locations of all vehicles in that interval.
 * if some of the interval has already been loaded,
 */
import uniqBy from 'lodash.uniqby'
import { useEffect, useState } from 'react'
import dayjs from 'src/dayjs'
import { VehicleLocation } from 'src/model/vehicleLocation'

const config = {
  apiUrl: 'https://open-bus-stride-api.hasadna.org.il/siri_vehicle_locations/list?get_count=false',
  limit: 10000, // the maximum number of vehicles to load in one request
  fromField: 'recorded_at_time_from',
  toField: 'recorded_at_time_to',
  lineRefField: 'siri_routes__line_ref',
  vehicleRefField: 'siri_ride__vehicle_ref',
  operatorRefField: 'siri_routes__operator_ref',
} as const

type Dateable = Date | number | string | dayjs.Dayjs

function formatTime(time: Dateable) {
  return dayjs(time).tz('Asia/Jerusalem').toISOString()
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
  constructor({
    from,
    to,
    lineRef,
    vehicleRef,
    operatorRef,
  }: {
    from: Dateable
    to: Dateable
    lineRef?: number
    vehicleRef?: number
    operatorRef?: number
  }) {
    this.#loadData({ from, to, lineRef, vehicleRef, operatorRef })
  }

  data: VehicleLocation[] = []
  loading = true

  async #loadData({
    from,
    to,
    lineRef,
    vehicleRef,
    operatorRef,
  }: {
    from: Dateable
    to: Dateable
    lineRef?: number
    vehicleRef?: number
    operatorRef?: number
  }) {
    let offset = 0
    for (let i = 1; this.loading; i++) {
      let url = config.apiUrl
      url += `&${config.fromField}=${formatTime(from)}&${config.toField}=${formatTime(to)}&limit=${
        config.limit * i
      }&offset=${offset}`
      if (operatorRef) url += `&${config.operatorRefField}=${operatorRef}`
      if (lineRef) url += `&${config.lineRefField}=${lineRef}`
      if (vehicleRef) url += `&${config.vehicleRefField}=${vehicleRef}`

      const response = await fetchWithQueue(url)
      const data: VehicleLocation[] = await response!.json()
      if (data.length === 0) {
        this.loading = false
        this.#notifyObservers({
          finished: true,
        })
      } else {
        this.data = [...this.data, ...data]
        this.#notifyObservers(data)
        offset += config.limit * i
      }
    }
    this.#observers = []
  }

  #notifyObservers(data: VehicleLocation[] | { finished: true }) {
    const observers = this.#observers
    console.log('notifying observers', observers.length)
    observers.forEach((observer) => observer(data))
  }

  #observers: ((locations: VehicleLocation[] | { finished: true }) => void)[] = []

  observe(observer: (locations: VehicleLocation[] | { finished: true }) => void) {
    if (this.loading) {
      this.#observers.push(observer)
    }
    observer(this.data)
    return () => {
      this.#observers = this.#observers.filter((o) => o !== observer)
    }
  }
}

const pool = new Array(10).fill(0).map(() => Promise.resolve<void | Response>(void 0))
async function fetchWithQueue(url: string) {
  const task = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await fetch(url)
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
function getLocations({
  from,
  to,
  lineRef,
  vehicleRef,
  onUpdate,
  operatorRef,
}: {
  from: Dateable
  to: Dateable
  lineRef?: number
  vehicleRef?: number
  operatorRef?: number
  onUpdate: (locations: VehicleLocation[] | { finished: true }) => void // the observer will be called every time with all the locations that were loaded
}) {
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
}: {
  from: Dateable
  to: Dateable
  lineRef?: number
  vehicleRef?: number
  operatorRef?: number
  splitMinutes?: false | number
  pause?: boolean
}) {
  const [locations, setLocations] = useState<VehicleLocation[]>([])
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
              uniqBy<VehicleLocation>(
                [...prev, ...data].sort((a, b) => a.id - b.id),
                (loc: VehicleLocation) => loc.id,
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
