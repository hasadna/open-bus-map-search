import React from 'react'
import { useGroupBy } from 'src/api/groupByService'
import { PageContainer } from '../components/PageContainer'
import OperatorHbarChart from './OperatorHbarChart/OperatorHbarChart'
import './DashboardPage.scss'
import { TEXTS } from 'src/resources/texts'

const DashboardPage = () => {
  const data = useGroupBy({
    dateTo: new Date(),
    dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    groupBy: 'operator_ref',
  }).map((item) => ({
    id: item.operator_ref?.agency_id || 'Unknown',
    name: item.operator_ref?.agency_name || 'Unknown',
    total: item.total_planned_rides,
    actual: item.total_actual_rides,
  }))

  return (
    <PageContainer>
      <h2 className="title">{TEXTS.dashboard_page_title}</h2>
      <OperatorHbarChart operators={data} />
    </PageContainer>
  )
}
export default DashboardPage
