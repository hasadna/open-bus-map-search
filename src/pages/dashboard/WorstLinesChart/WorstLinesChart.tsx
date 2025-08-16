import { Skeleton } from 'antd'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import LinesHbarChart, { LineBar } from './LineHbarChart/LinesHbarChart'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import { MAJOR_OPERATORS } from 'src/model/operator'
import Widget from 'src/shared/Widget'
import { Dayjs } from 'src/dayjs'

interface WorstLinesChartProps {
  startDate: Dayjs
  endDate: Dayjs
  operatorId?: string
  alertWorstLineHandling: (arg: boolean) => void
}

const convertToWorstLineChartCompatibleStruct = (arr: GroupByRes[], operatorId?: string) => {
  if (!arr || !arr.length) return []
  return arr
    .filter((row) => {
      if (operatorId) return row.operatorRef?.operatorRef.toString() === operatorId
      return row.operatorRef && MAJOR_OPERATORS.includes(row.operatorRef.operatorRef.toString())
    })
    .map(
      (item) =>
        ({
          id: `${item.lineRef}|${item.operatorRef?.operatorRef}` || 'Unknown',
          operator_name: item.operatorRef?.agencyName || 'Unknown',
          short_name: JSON.parse(item.routeShortName || "['']")[0],
          long_name: item.routeLongName,
          total: item.totalPlannedRides,
          actual: item.totalActualRides,
        }) as LineBar,
    )
}

export const WorstLinesChart = ({
  startDate,
  endDate,
  operatorId,
  alertWorstLineHandling,
}: WorstLinesChartProps) => {
  const [groupByLineData, lineDataLoading] = useGroupBy({
    dateFrom: startDate.valueOf(),
    dateTo: endDate.valueOf(),
    groupBy: 'operator_ref,line_ref',
  })

  const { t } = useTranslation()

  useEffect(() => {
    const totalElements = groupByLineData.length
    const totalZeroElements = groupByLineData.filter((el) => el.totalActualRides === 0).length
    if (totalElements === 0 || totalZeroElements === totalElements) {
      alertWorstLineHandling(true)
    } else {
      alertWorstLineHandling(false)
    }
  }, [groupByLineData])

  return (
    <Widget title={t('worst_lines_page_title')}>
      {lineDataLoading ? (
        <Skeleton active />
      ) : (
        <LinesHbarChart
          lines={convertToWorstLineChartCompatibleStruct(groupByLineData, operatorId)}
        />
      )}
    </Widget>
  )
}

export default WorstLinesChart
