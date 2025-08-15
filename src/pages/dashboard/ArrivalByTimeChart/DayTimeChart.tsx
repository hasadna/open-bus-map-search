import { Radio, RadioChangeEvent, Skeleton } from 'antd'
import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ArrivalByTimeChart, { ArrivalByTimeData } from './ArrivalByTimeChart'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import Widget from 'src/shared/Widget'
import { Dayjs } from 'src/dayjs'

const convertToGraphCompatibleStruct = (arr: GroupByRes[]) => {
  return arr.map((item: GroupByRes) => {
    return {
      operatorId: item.operatorRef?.operatorRef.toString() || 'Unknown',
      name: item.operatorRef?.agencyName || 'Unknown',
      current: item.totalActualRides,
      max: item.totalPlannedRides,
      percent: (item.totalActualRides / item.totalPlannedRides) * 100,
      gtfsRouteDate: item.gtfsRouteDate ? new Date(item.gtfsRouteDate) : undefined,
      gtfsRouteHour: item.gtfsRouteHour ? new Date(item.gtfsRouteHour) : undefined,
    } as ArrivalByTimeData
  })
}

interface DayTimeChartProps {
  startDate: Dayjs
  endDate: Dayjs
  operatorId: string
  alertAllDayTimeChartHandling: (arg: boolean) => void
}

const DayTimeChart: FC<DayTimeChartProps> = ({
  startDate,
  endDate,
  operatorId,
  alertAllDayTimeChartHandling,
}) => {
  const { t } = useTranslation()
  const [groupByHour, setGroupByHour] = useState<boolean>(false)

  const [data, loadingGraph] = useGroupBy({
    dateFrom: startDate.valueOf(),
    dateTo: endDate.valueOf(),
    groupBy: groupByHour ? 'operator_ref,gtfs_route_hour' : 'operator_ref,gtfs_route_date',
  })

  const graphData = useMemo(
    () => convertToGraphCompatibleStruct(data),
    [endDate, groupByHour, startDate, data.length],
  )

  useEffect(() => {
    const totalElements = data.length
    const totalZeroElements = data.filter((el) => el.totalActualRides === 0).length
    if (totalElements === 0 || totalZeroElements === totalElements) {
      alertAllDayTimeChartHandling(true)
    } else {
      alertAllDayTimeChartHandling(false)
    }
  }, [data])

  return (
    <Widget title={t(`dashboard_page_graph_title_${groupByHour ? 'hour' : 'day'}`)} marginBottom>
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
