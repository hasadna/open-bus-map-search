import {
  GovLinesByLinePostRequest,
  GovStationsByLinePostRequest,
} from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { GOVERNMENT_TRANSPORTATION_API } from 'src/api/apiConfig'
import { Point } from 'src/pages/timeBasedMap'

export const useGovTimeQuery = () => {
  return useQuery({
    queryKey: ['gov_time', dayjs().startOf('day').valueOf()],
    queryFn: async () => {
      const res = await GOVERNMENT_TRANSPORTATION_API.govTimeGet()
      return dayjs(res.data?.serverTime)
    },
  })
}

export const useBusOperatorQuery = () => {
  return useQuery({
    queryKey: ['busOpreator', dayjs().startOf('day').valueOf()],
    queryFn: async () => {
      const res = await GOVERNMENT_TRANSPORTATION_API.govOperatorsGet()
      return res.data?.map(({ dataText, dataCode }) => ({ label: dataText, value: dataCode }))
    },
  })
}

export const useRoutesQueary = (queary?: Partial<GovLinesByLinePostRequest>) => {
  const keys = Object.values(queary || {})
  return useQuery({
    queryKey: ['routes', ...keys],
    queryFn: async () => {
      if (keys.some((v) => v === -1)) return undefined

      const res = await GOVERNMENT_TRANSPORTATION_API.govLinesByLinePost({
        govLinesByLinePostRequest: queary as GovLinesByLinePostRequest,
      })

      return res.data?.map(({ directionText, directionCode }) => ({
        label: directionText,
        value: directionCode,
      }))
    },
  })
}

export const useBoardingStationQuery = (queary?: Partial<GovStationsByLinePostRequest>) => {
  const keys = Object.values(queary || {})
  return useQuery({
    queryKey: ['Bording_station', ...keys],
    queryFn: async () => {
      if (keys.some((v) => v === null)) return undefined

      const res = await GOVERNMENT_TRANSPORTATION_API.govStationsByLinePost({
        govStationsByLinePostRequest: queary as GovStationsByLinePostRequest,
      })

      return res.data?.map(({ stationFullName, stationId }) => ({
        label: stationFullName,
        value: stationId,
      }))
    },
  })
}

export const useSiriRideQuery = (position: Point) => {
  return useQuery({
    queryKey: [
      'ride',
      position.point?.siri_route__id,
      position.point?.siri_ride__vehicle_ref,
      position.point?.siri_route__line_ref,
    ],
    queryFn: async () => {
      const { getSiriRideWithRelated } = await import('src/api/siriService')
      const siri = await getSiriRideWithRelated(
        position.point?.siri_route__id?.toString() ?? '',
        position.point?.siri_ride__vehicle_ref?.toString() ?? '',
        position.point?.siri_route__line_ref?.toString() ?? '',
      )

      const gov = await GOVERNMENT_TRANSPORTATION_API.govLinesByLinePost({
        govLinesByLinePostRequest: {
          eventDate: siri.gtfsRouteDate?.valueOf() || -1,
          operatorId: siri.gtfsRouteOperatorRef || -1,
          operatorLineId: Number(siri.gtfsRouteRouteShortName) || -1,
        },
      })
      return { siri, gov: gov.data }
    },
  })
}
