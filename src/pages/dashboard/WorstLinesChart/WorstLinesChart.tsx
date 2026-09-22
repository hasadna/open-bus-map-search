import { useTranslation } from 'react-i18next'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import { MAJOR_OPERATORS } from 'src/model/operator'
import { type CivilDate } from 'src/model/time/civilDate'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import Widget from 'src/shared/Widget'
import LinesHbarChart, { LineBar } from './LineHbarChart/LinesHbarChart'

interface WorstLinesChartProps {
  startDate: CivilDate
  endDate: CivilDate
  operatorId?: string
}

const convertToWorstLineChartCompatibleStruct = (arr: GroupByRes[], operatorId?: string) => {
  if (!arr || !arr.length) return []
  return arr
    .filter((row) => {
      if (operatorId) return row.operatorRef?.operatorRef.toString() === operatorId
      return row.operatorRef && MAJOR_OPERATORS.has(row.operatorRef.operatorRef.toString())
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

export const WorstLinesChart = ({ startDate, endDate, operatorId }: WorstLinesChartProps) => {
  const [groupByLineData, lineDataLoading] = useGroupBy({
    dateFrom: startDate,
    dateTo: endDate,
    groupBy: 'operator_ref,line_ref',
  })

  const { t } = useTranslation()

  return (
    <Widget title={t('worst_lines_page_title')}>
      {lineDataLoading ? (
        <SkeletonLoader active />
      ) : (
        <LinesHbarChart
          lines={convertToWorstLineChartCompatibleStruct(groupByLineData, operatorId)}
        />
      )}
    </Widget>
  )
}

export default WorstLinesChart
