/**
 * this is a custom hook that fetches the vehicle locations from the API.
 * it recieves an interval of two dates, and loads locations of all vehicles in that interval.
 * if some of the interval has already been loaded,
 */

import _ from 'lodash'
import { useEffect, useState } from 'react'
import { VehicleLocation } from 'src/model/vehicleLocation'

const config = {
  apiUrl: 'https://open-bus-stride-api.hasadna.org.il/siri_vehicle_locations/list?get_count=false',
  limit: 500, // the maximum number of vehicles to load in one request
  fromField: 'recorded_at_time_from',
  toField: 'recorded_at_time_to',
} as const

type Dateable = Date | number | string

function formatTime(time: Dateable) {
  const date = new Date(time).toISOString()
  return date
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
  constructor({ from, to }: { from: Dateable; to: Dateable }) {
    this.#loadData({ from, to })
  }

  data: VehicleLocation[] = []
  loading = true

  async #loadData({ from, to }: { from: Dateable; to: Dateable }) {
    let offset = 0
    for (let i = 1; this.loading; i++) {
      const response = await fetch(
        `${config.apiUrl}&${config.fromField}=${formatTime(from)}&${config.toField}=${formatTime(
          to,
        )}&limit=${config.limit * i}&offset=${offset}`,
      )
      const data = await response.json()
      if (data.length === 0) {
        this.loading = false
      } else {
        this.data = [...this.data, ...data]
        this.#notifyObservers(data)
        offset += config.limit * i
      }
    }
    this.#observers = []
  }

  #notifyObservers(data: VehicleLocation[]) {
    const observers = this.#observers
    console.log('notifying observers', observers.length)
    observers.forEach((observer) => observer(data))
  }

  #observers: ((locations: VehicleLocation[]) => void)[] = []

  observe(observer: (locations: VehicleLocation[]) => void) {
    if (this.loading) {
      this.#observers.push(observer)
    }
    observer(this.data)
    return () => {
      this.#observers = this.#observers.filter((o) => o !== observer)
    }
  }
}

// this function checks the cache for the data, and if it's not there, it loads it
function getLocations(
  from: Dateable,
  to: Dateable,
  update: (locations: VehicleLocation[]) => void, // the observer will be called every time with all the locations that were loaded
) {
  const key = `${formatTime(from)}-${formatTime(to)}`
  if (!loadedLocations.has(key)) {
    loadedLocations.set(key, new LocationObservable({ from, to }))
  }
  const observable = loadedLocations.get(key)!
  return observable.observe(update)
}

function getMinutesInRange(from: Dateable, to: Dateable) {
  const start = new Date(from).setSeconds(0, 0)
  const end = new Date(to).setSeconds(0, 0)

  // array of minutes to load
  const minutes = Array.from({ length: (end - start) / 60000 }, (_, i) => ({
    from: new Date(start + i * 60000),
    to: new Date(start + (i + 1) * 60000),
  }))
  return minutes
}

export default function useVehicleLocations({ from, to }: { from: Dateable; to: Dateable }) {
  const [locations, setLocations] = useState<VehicleLocation[]>([])
  useEffect(() => {
    const unmounts = getMinutesInRange(from, to).map(({ from, to }) =>
      getLocations(from, to, (locations) => {
        setLocations((prev) =>
          _.uniqBy(
            [...prev, ...locations].sort((a, b) => a.id - b.id),
            (loc) => loc.id,
          ),
        )
      }),
    )
    return () => {
      setLocations([])
      unmounts.forEach((unmount) => unmount())
    }
  }, [from, to])
  return locations
}

export {}
