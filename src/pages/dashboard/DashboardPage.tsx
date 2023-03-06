import React from 'react'
import { useGroupBy } from 'src/api/groupByService'
import { PageContainer } from '../components/PageContainer'
import OperatorHbarChart from './OperatorHbarChart/OperatorHbarChart'
import './DashboardPage.scss'
import { TEXTS } from 'src/resources/texts'
import ArrivalByTimeChart from './ArrivalByTimeChart/ArrivalByTimeChart'

const now = new Date()

const DashboardPage = () => {
  const hbarData = useGroupBy({
    dateTo: now,
    dateFrom: new Date(Number(now) - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    groupBy: 'operator_ref',
  }).map((item) => ({
    id: item.operator_ref?.agency_id || 'Unknown',
    name: item.operator_ref?.agency_name || 'Unknown',
    total: item.total_planned_rides,
    actual: item.total_actual_rides,
  }))

  const graphData = useGroupBy({
    dateTo: now,
    dateFrom: new Date(Number(now) - 1000 * 60 * 60 * 24 * 20), // 20 days ago
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
      <OperatorHbarChart operators={hbarData} />
      <h2 className="title">{TEXTS.dashboard_page_negative_title}</h2>
      <OperatorHbarChart operators={hbarData} complement />
      <h2 className="title">{TEXTS.dashboard_page_graph_title}</h2>
      <ArrivalByTimeChart data={graphData} />
    </PageContainer>
  )
}
export default DashboardPage
