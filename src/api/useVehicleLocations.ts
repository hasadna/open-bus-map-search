/**
 * this is a custom hook that fetches the vehicle locations from the API.
 * it recieves an interval of two dates, and loads locations of all vehicles in that interval.
 * if some of the interval has already been loaded,
 */

import _ from 'lodash'
import moment, { Moment } from 'moment'
import { useEffect, useState } from 'react'
import { VehicleLocation } from 'src/model/vehicleLocation'

const config = {
  apiUrl: 'https://open-bus-stride-api.hasadna.org.il/siri_vehicle_locations/list?get_count=false',
  limit: 500, // the maximum number of vehicles to load in one request
  fromField: 'recorded_at_time_from',
  toField: 'recorded_at_time_to',
  lineRefField: 'siri_routes__line_ref',
} as const

type Dateable = Date | number | string | Moment

function formatTime(time: Dateable) {
  if (moment.isMoment(time)) {
    time = time.toDate()
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
  constructor({ from, to, lineRef }: { from: Dateable; to: Dateable; lineRef?: number }) {
    this.#loadData({ from, to, lineRef })
  }

  data: VehicleLocation[] = []
  loading = true

  async #loadData({ from, to, lineRef }: { from: Dateable; to: Dateable; lineRef?: number }) {
    let offset = 0
    for (let i = 1; this.loading; i++) {
      let url = config.apiUrl
      url += `&${config.fromField}=${formatTime(from)}&${config.toField}=${formatTime(to)}&limit=${
        config.limit * i
      }&offset=${offset}`
      if (lineRef) url += `&${config.lineRefField}=${lineRef}`

      const response = await fetchWithQueue(url)
      const data = await response!.json()
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
async function fetchWithQueue(url: string, retries = 10) {
  let queue = pool.shift()!
  queue = queue
    .then(() => fetch(url))
    .catch(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10000 * Math.random() + 100))
      return fetchWithQueue(url, retries - 1)
    })
  pool.push(queue)
  return queue
}

// this function checks the cache for the data, and if it's not there, it loads it
function getLocations({
  from,
  to,
  lineRef,
  onUpdate,
}: {
  from: Dateable
  to: Dateable
  lineRef?: number
  onUpdate: (locations: VehicleLocation[] | { finished: true }) => void // the observer will be called every time with all the locations that were loaded
}) {
  const key = `${formatTime(from)}-${formatTime(to)}`
  if (!loadedLocations.has(key)) {
    loadedLocations.set(key, new LocationObservable({ from, to, lineRef }))
  }
  const observable = loadedLocations.get(key)!
  return observable.observe(onUpdate)
}

function getMinutesInRange(from: Dateable, to: Dateable, minutesGap = 1) {
  const start = moment(from).startOf('minute')
  const end = moment(to).startOf('minute')
  const gap = 60000 * minutesGap

  // array of minutes to load
  const minutes = Array.from({ length: end.diff(start, 'minutes') / gap }, (_, i) => ({
    from: start.clone().add(i * gap, 'minutes'),
    to: start.clone().add((i + 1) * gap, 'minutes'),
  }))
  return minutes
}

export default function useVehicleLocations({
  from,
  to,
  lineRef,
  splitMinutes: split = 1,
}: {
  from: Dateable
  to: Dateable
  lineRef?: number
  splitMinutes?: false | number
}) {
  const [locations, setLocations] = useState<VehicleLocation[]>([])
  const [isLoading, setIsLoading] = useState<boolean[]>([])
  useEffect(() => {
    const range = split ? getMinutesInRange(from, to) : [{ from, to }]
    setIsLoading(range.map(() => true))
    const unmounts = range.map(({ from, to }, i) =>
      getLocations({
        from,
        to,
        lineRef,
        onUpdate: (data) => {
          if ('finished' in data) {
            setIsLoading((prev) => {
              const newIsLoading = [...prev]
              newIsLoading[i] = false
              return newIsLoading
            })
          } else {
            setLocations((prev) =>
              _.uniqBy(
                [...prev, ...data].sort((a, b) => a.id - b.id),
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
  }, [from, to])
  return {
    locations,
    isLoading: isLoading.some((loading) => loading),
  }
}

export {}
