import React, { useCallback } from 'react'
import { useGroupBy } from 'src/api/groupByService'
import { PageContainer } from '../components/PageContainer'
import OperatorHbarChart from './OperatorHbarChart/OperatorHbarChart'
import './DashboardPage.scss'
import { TEXTS } from 'src/resources/texts'
import ArrivalByTimeChart from './ArrivalByTimeChart/ArrivalByTimeChart'
import { DatePicker } from 'antd'
import moment, { Moment } from 'moment'

const now = moment()

function useDate(initialValue: Moment) {
  const [date, setDate] = React.useState<Moment>(initialValue)
  const onChange = useCallback((date: Moment | null) => {
    if (date) {
      setDate(date)
    }
  }, [])
  return [date, onChange] as const
}

const DashboardPage = () => {
  const [startDate, setStartDate] = useDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = useDate(now.clone())

  const hbarData = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: 'operator_ref',
  }).map((item) => ({
    id: item.operator_ref?.agency_id || 'Unknown',
    name: item.operator_ref?.agency_name || 'Unknown',
    total: item.total_planned_rides,
    actual: item.total_actual_rides,
  }))

  const graphData = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: 'gtfs_route_date,operator_ref',
  }).map((item) => ({
    id: item.operator_ref?.agency_id || 'Unknown',
    name: item.operator_ref?.agency_name || 'Unknown',
    percent: (item.total_actual_rides / item.total_planned_rides) * 100,
    gtfs_route_date: item.gtfs_route_date,
  }))

  return (
    <PageContainer>
      <h2 className="title">{TEXTS.dashboard_page_title}</h2>
      <div className="date-picker-container">
        <DatePicker
          defaultValue={startDate}
          onChange={(data) => setStartDate(data)}
          format="DD/MM/YYYY"
        />
        -
        <DatePicker
          defaultValue={endDate}
          onChange={(data) => setEndDate(data)}
          format="DD/MM/YYYY"
        />
      </div>
      <OperatorHbarChart operators={hbarData} />
      <h2 className="title">{TEXTS.dashboard_page_negative_title}</h2>
      <OperatorHbarChart operators={hbarData} complement />
      <h2 className="title">{TEXTS.dashboard_page_graph_title}</h2>
      <ArrivalByTimeChart data={graphData} />
    </PageContainer>
  )
}
export default DashboardPage
