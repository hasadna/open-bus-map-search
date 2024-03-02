import { Skeleton } from 'antd'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import LinesHbarChart from './LineHbarChart/LinesHbarChart'
import { useTranslation } from 'react-i18next'
import { FC } from 'react'
import { Moment } from 'moment/moment'
import Widget from 'src/shared/Widget'

interface WorstLinesChartProps {
  startDate: Moment
  endDate: Moment
  operatorId: string
}

export const WorstLinesChart: FC<WorstLinesChartProps> = ({ startDate, endDate, operatorId }) => {
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
        (row: GroupByRes) => row.operator_ref?.agency_id === operatorId || !Number(operatorId),
      )
      .map((item: GroupByRes) => ({
        id: `${item.line_ref}|${item.operator_ref?.agency_id}` || 'Unknown',
        operator_name: item.operator_ref?.agency_name || 'Unknown',
        short_name: JSON.parse(item.route_short_name)[0],
        long_name: item.route_long_name,
        total: item.total_planned_rides,
        actual: item.total_actual_rides,
      }))
  }

  return (
    <Widget>
      <h2 className="title">{t('worst_lines_page_title')}</h2>
      {lineDataLoading ? (
        <Skeleton active />
      ) : (
        <LinesHbarChart
          lines={convertToWorstLineChartCompatibleStruct(groupByLineData, operatorId)}
          operators_whitelist={['אלקטרה אפיקים', 'דן', 'מטרופולין', 'קווים', 'אגד', 'תנופה']}
        />
      )}
    </Widget>
  )
}

export default WorstLinesChart
