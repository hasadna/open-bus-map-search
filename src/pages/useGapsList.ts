import { useEffect, useState } from 'react'
import { Moment } from 'moment'
import { getGapsAsync } from '../api/gapsService'

import { sortByMode, HourlyData, processData } from './components/utils'
import { GapsList } from 'src/model/gaps'

export const useGapsList = (
  fromDate: Moment,
  toDate: Moment,
  operatorRef: string,
  lineRef: number,
  sortingMode: string,
): HourlyData[] => {

  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gapsList: GapsList = await getGapsAsync(fromDate, toDate, operatorRef, lineRef)
        console.log(gapsList[0])
        const result = processData(gapsList)
        setHourlyData(sortByMode(result, sortingMode))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [lineRef, operatorRef, fromDate, toDate, sortingMode])
  return hourlyData
}
