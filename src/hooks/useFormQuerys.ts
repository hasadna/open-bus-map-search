import {
  GovLinesByLinePostRequest,
  GovStationsByLinePostRequest,
} from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { GOVERNMENT_TRANSPORTATION_API } from 'src/api/apiConfig'

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

export const useBoardingStationQuery = (query: Partial<GovStationsByLinePostRequest>) => {
  const keys = Object.values(query)
  return useQuery({
    queryKey: ['Bording_station', ...keys],
    queryFn: async () => {
      if (keys.some((v) => v == null)) return undefined

      const res = await GOVERNMENT_TRANSPORTATION_API.govStationsByLinePost({
        govStationsByLinePostRequest: query as GovStationsByLinePostRequest,
      })

      return res.data?.map(({ stationFullName, stationId }) => ({
        label: stationFullName,
        value: stationId,
      }))
    },
  })
}

export const useLinesQuery = (query: Partial<GovLinesByLinePostRequest>) => {
  const keys = Object.values(query)

  return useQuery({
    queryKey: ['ride', ...keys],
    queryFn: async () => {
      if (keys.some((v) => v == null)) return []
      const res = await GOVERNMENT_TRANSPORTATION_API.govLinesByLinePost({
        govLinesByLinePostRequest: query as GovLinesByLinePostRequest,
      })
      return [...new Map(res.data?.map((line) => [line.directionText, line])).values()]
    },
  })
}
