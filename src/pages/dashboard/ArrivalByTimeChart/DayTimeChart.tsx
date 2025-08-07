import { Radio, RadioChangeEvent, Skeleton } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ArrivalByTimeChart from './ArrivalByTimeChart'
import { useGroupBy } from 'src/api/groupByService'
import Widget from 'src/shared/Widget'
import { Dayjs } from 'src/dayjs'

interface DayTimeChartProps {
  startDate: Dayjs
  endDate: Dayjs
  operatorId?: number
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
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: groupByHour ? 'operator_ref,gtfs_route_hour' : 'operator_ref,gtfs_route_date',
  })

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
    <Widget marginBottom>
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
        <ArrivalByTimeChart data={data} operatorId={operatorId} />
      )}
    </Widget>
  )
}

export default DayTimeChart
