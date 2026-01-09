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

  data: SiriVehicleLocationWithRelatedPydanticModel[] = []
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
      const response = await SIRI_API.siriVehicleLocationsListGet({
        recordedAtTimeFrom: dayjs(from).toDate(),
        recordedAtTimeTo: dayjs(to).toDate(),
        limit: LIMIT * i,
        offset,
        siriRoutesOperatorRef: operatorRef?.toString(),
        siriRoutesLineRef: lineRef?.toString(),
        siriRideVehicleRef: vehicleRef?.toString(),
        getCount: false,
      })
      const data = response
      if (data.length === 0) {
        this.loading = false
        this.#notifyObservers({
          finished: true,
        })
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
    console.log('notifying observers', observers.length)
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
  onUpdate: (locations: SiriVehicleLocationWithRelatedPydanticModel[] | { finished: true }) => void // the observer will be called every time with all the locations that were loaded
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
