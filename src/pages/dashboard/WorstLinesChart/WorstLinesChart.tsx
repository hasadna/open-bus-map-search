import { Skeleton } from 'antd'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import LinesHbarChart from './LineHbarChart/LinesHbarChart'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import { MAJOR_OPERATORS } from 'src/model/operator'
import Widget from 'src/shared/Widget'
import { Dayjs } from 'src/dayjs'

interface WorstLinesChartProps {
  startDate: Dayjs
  endDate: Dayjs
  operatorId: string
  alertWorstLineHandling: (arg: boolean) => void
}

export const WorstLinesChart = ({
  startDate,
  endDate,
  operatorId,
  alertWorstLineHandling,
}: WorstLinesChartProps) => {
  const [groupByLineData, lineDataLoading] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: 'operator_ref,line_ref',
  })

  const { t } = useTranslation()
  const convertToWorstLineChartCompatibleStruct = (arr: GroupByRes[], operatorId: string) => {
    if (!arr || !arr.length) return []
    return arr
      .filter(
        (row) =>
          operatorId || (row.operator_ref && MAJOR_OPERATORS.includes(row.operator_ref.agency_id)),
      )
      .filter((row) => row.operator_ref?.agency_id === operatorId || !Number(operatorId))
      .map((item) => ({
        id: `${item.line_ref}|${item.operator_ref?.agency_id}` || 'Unknown',
        operator_name: item.operator_ref?.agency_name || 'Unknown',
        short_name: JSON.parse(item.route_short_name)[0],
        long_name: item.route_long_name,
        total: item.total_planned_rides,
        actual: item.total_actual_rides,
      }))
  }

  useEffect(() => {
    const totalElements = groupByLineData.length
    const totalZeroElements = groupByLineData.filter((el) => el.total_actual_rides === 0).length
    if (totalElements === 0 || totalZeroElements === totalElements) {
      alertWorstLineHandling(true)
    } else {
      alertWorstLineHandling(false)
    }
  }, [groupByLineData])

  return (
    <Widget>
      <h2 className="title">{t('worst_lines_page_title')}</h2>
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
