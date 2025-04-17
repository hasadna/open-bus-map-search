import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton, Radio, RadioChangeEvent } from 'antd'
import { Moment } from 'moment/moment'
import ArrivalByTimeChart from './ArrivalByTimeChart'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import Widget from 'src/shared/Widget'

const convertToGraphCompatibleStruct = (arr: GroupByRes[]) => {
  return arr.map((item: GroupByRes) => ({
    id: item.operator_ref?.agency_id || 'Unknown',
    name: item.operator_ref?.agency_name || 'Unknown',
    current: item.total_actual_rides,
    max: item.total_planned_rides,
    percent: (item.total_actual_rides / item.total_planned_rides) * 100,
    gtfs_route_date: item.gtfs_route_date,
    gtfs_route_hour: item.gtfs_route_hour,
  }))
}

interface DayTimeChartProps {
  startDate: Moment
  endDate: Moment
  operatorId: string
}

const DayTimeChart = ({ startDate, endDate, operatorId }: DayTimeChartProps) => {
  const { t } = useTranslation()
  const [groupByHour, setGroupByHour] = useState<boolean>(false)

  const [data, loadingGraph] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: groupByHour ? 'operator_ref,gtfs_route_hour' : 'operator_ref,gtfs_route_date',
  })

  const graphData = useMemo(
    () => convertToGraphCompatibleStruct(data),
    [endDate, groupByHour, startDate, data.length],
  )

  return (
    <Widget>
      <h2 className="title">
        {groupByHour ? t('dashboard_page_graph_title_hour') : t('dashboard_page_graph_title_day')}
      </h2>
      <Radio.Group
        style={{ marginBottom: '10px' }}
        onChange={(e: RadioChangeEvent) => setGroupByHour(e.target.value === 'byHour')}
        defaultValue="byDay">
        <Radio.Button value="byDay">{t('group_by_day_tooltip_content')}</Radio.Button>
        <Radio.Button value="byHour">{t('group_by_hour_tooltip_content')}</Radio.Button>
      </Radio.Group>
      {loadingGraph ? (
        <Skeleton active />
      ) : (
        <ArrivalByTimeChart data={graphData} operatorId={operatorId} />
      )}
    </Widget>
  )
}

export default DayTimeChart
