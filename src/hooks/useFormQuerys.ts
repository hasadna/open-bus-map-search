import {
  GovLinesByLinePostRequest,
  GovStationsByLinePostRequest,
  LineModel,
} from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo } from 'react'
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

export const useBoardingStationQuery = (line: LineModel = {}) => {
  const { directionCode, eventDate, lineCode, operatorId } = line

  const boardingQuery = useMemo(() => {
    if (!directionCode || !eventDate || !lineCode || !operatorId) return null
    return {
      govStationsByLinePostRequest: {
        directions: directionCode,
        eventDate: dayjs(eventDate).valueOf(),
        officelineId: lineCode,
        operatorId: operatorId,
      } as GovStationsByLinePostRequest,
    }
  }, [line])

  return useQuery({
    queryKey: ['Bording_station', directionCode, eventDate, lineCode, operatorId],
    queryFn: async () => {
      if (!boardingQuery) return []

      const res = await GOVERNMENT_TRANSPORTATION_API.govStationsByLinePost(boardingQuery)

      return res.data?.map(({ stationFullName, stationId }) => ({
        label: stationFullName,
        value: stationId,
      }))
    },
  })
}

export const useLinesQuery = (eventDate?: string, operator?: string, lineNumber?: string) => {
  const linesQuery = useMemo(() => {
    if (!eventDate || !operator || !lineNumber) return null
    return {
      govLinesByLinePostRequest: {
        eventDate: dayjs(eventDate).valueOf(),
        operatorId: Number(operator),
        operatorLineId: Number(lineNumber),
      } as GovLinesByLinePostRequest,
    }
  }, [eventDate, operator, lineNumber])

  return useQuery({
    queryKey: ['ride', eventDate, operator, lineNumber],
    queryFn: async () => {
      if (!linesQuery) return []
      const res = await GOVERNMENT_TRANSPORTATION_API.govLinesByLinePost(linesQuery)
      return [...new Map(res.data?.map((line) => [line.directionText, line])).values()]
    },
  })
}
