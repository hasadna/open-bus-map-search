import { Radio, RadioChangeEvent, Skeleton } from 'antd'
import { FC, useEffect, useMemo, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardContextType, DashboardCtx } from '../DashboardContext'
import ArrivalByTimeChart from './ArrivalByTimeChart'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import Widget from 'src/shared/Widget'
import { Dayjs } from 'src/dayjs'

const convertToGraphCompatibleStruct = (arr: GroupByRes[]) => {
  return arr.map((item: GroupByRes) => ({
    id: item.operator_ref?.operatorRef.toString() || 'Unknown',
    name: item.operator_ref?.agencyName || 'Unknown',
    current: item.total_actual_rides,
    max: item.total_planned_rides,
    percent: (item.total_actual_rides / item.total_planned_rides) * 100,
    gtfs_route_date: item.gtfs_route_date,
    gtfs_route_hour: item.gtfs_route_hour,
  }))
}

interface DayTimeChartProps {
  startDate: Dayjs
  endDate: Dayjs
  operatorId: string
}

const DayTimeChart: FC<DayTimeChartProps> = ({ startDate, endDate, operatorId }) => {
  const { t } = useTranslation()
  const { setDayTimeChartIsLoading, setDayTimeChartIsEmpty } =
    useContext<DashboardContextType>(DashboardCtx)
  const [groupByHour, setGroupByHour] = useState<boolean>(false)

  const [data, isLoadingGraph] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: groupByHour ? 'operator_ref,gtfs_route_hour' : 'operator_ref,gtfs_route_date',
  })

  const graphData = useMemo(
    () => convertToGraphCompatibleStruct(data),
    [endDate, groupByHour, startDate, data.length],
  )

  useEffect(() => {
    setDayTimeChartIsLoading(isLoadingGraph)
  }, [isLoadingGraph, setDayTimeChartIsLoading])

  useEffect(() => {
    if (!isLoadingGraph) {
      const totalElements = data.length
      const totalZeroElements = data.filter((el) => el.total_actual_rides === 0).length
      if (totalElements === 0 || totalZeroElements === totalElements) {
        setDayTimeChartIsEmpty(true)
      } else {
        setDayTimeChartIsEmpty(false)
      }
    }
  }, [data, isLoadingGraph])

  return (
    <Widget title={t(`dashboard_page_graph_title_${groupByHour ? 'hour' : 'day'}`)} marginBottom>
      <Radio.Group
        style={{ marginBottom: '10px' }}
        onChange={(e: RadioChangeEvent) => setGroupByHour(e.target.value === 'byHour')}
        defaultValue="byDay">
        <Radio.Button value="byDay">{t('group_by_day_tooltip_content')}</Radio.Button>
        <Radio.Button value="byHour">{t('group_by_hour_tooltip_content')}</Radio.Button>
      </Radio.Group>
      {isLoadingGraph ? (
        <Skeleton active />
      ) : (
        <ArrivalByTimeChart data={graphData} operatorId={operatorId} />
      )}
    </Widget>
  )
}

export default DayTimeChart
