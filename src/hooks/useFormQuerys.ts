import {
  GovLinesByLinePostRequest,
  GovStationsByLinePostRequest,
  LineModel,
} from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { GOVERNMENT_TRANSPORTATION_API } from 'src/api/apiConfig'

const STALE_TIME = 5 * 60 * 1000 // 5 minutes
const GC_TIME = 10 * 60 * 1000 // 10 minutes

export const useGovTimeQuery = () => {
  return useQuery({
    queryKey: ['gov_time'],
    queryFn: async () => (await GOVERNMENT_TRANSPORTATION_API.govTimeGet()).data?.serverTime,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export const useBusOperatorQuery = () => {
  return useQuery({
    queryKey: ['bus_operator'],
    queryFn: async () => (await GOVERNMENT_TRANSPORTATION_API.govOperatorsGet()).data,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export const useBoardingStationQuery = (line: LineModel) => {
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
    queryKey: [
      'boarding_station',
      boardingQuery?.govStationsByLinePostRequest.directions,
      boardingQuery?.govStationsByLinePostRequest.eventDate,
      boardingQuery?.govStationsByLinePostRequest.officelineId,
      boardingQuery?.govStationsByLinePostRequest.operatorId,
    ],
    queryFn: async () => {
      if (!boardingQuery) return []
      return (await GOVERNMENT_TRANSPORTATION_API.govStationsByLinePost(boardingQuery)).data
    },
    enabled: !!boardingQuery,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
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
    queryKey: [
      'ride',
      linesQuery?.govLinesByLinePostRequest.eventDate,
      linesQuery?.govLinesByLinePostRequest.operatorId,
      linesQuery?.govLinesByLinePostRequest.operatorLineId,
    ],
    queryFn: async () => {
      if (!linesQuery) return []
      const res = await GOVERNMENT_TRANSPORTATION_API.govLinesByLinePost(linesQuery)
      return [...new Map(res.data?.map((line) => [line.directionText, line])).values()]
    },
    enabled: !!linesQuery,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}
