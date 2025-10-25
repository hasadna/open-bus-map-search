import { GovStationsByLinePostRequest } from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { GOVERNMENT_TRANSPORTATION_API } from 'src/api/apiConfig'
import { getSiriRideWithRelated } from 'src/api/siriService'
import { Point } from 'src/pages/timeBasedMap'

export const useGovTimeQuery = () => {
  return useQuery({
    queryKey: ['gov_time', dayjs().startOf('day').valueOf()],
    queryFn: async () => {
      const res = await GOVERNMENT_TRANSPORTATION_API.govTimeGet()
      return res.data?.serverTime
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

export const useBoardingStationQuery = (queary: Partial<GovStationsByLinePostRequest>) => {
  const keys = Object.values(queary)
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
      const siri = await getSiriRideWithRelated(
        position.point?.siri_route__id?.toString() ?? '',
        position.point?.siri_ride__vehicle_ref?.toString() ?? '',
        position.point?.siri_route__line_ref?.toString() ?? '',
      )

      const lines = await GOVERNMENT_TRANSPORTATION_API.govLinesByLinePost({
        govLinesByLinePostRequest: {
          eventDate: position.recorded_at_time || -1,
          operatorId: position.operator || -1,
          operatorLineId: Number(siri.gtfsRouteRouteShortName) || -1,
        },
      })

      const unique = [...new Map(lines?.data?.map((line) => [line.directionText, line])).values()]

      return { siri, lines: unique }
    },
  })
}
