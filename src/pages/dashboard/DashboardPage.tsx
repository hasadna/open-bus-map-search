import React from 'react'
import { useGroupBy } from 'src/api/groupByService'
import { PageContainer } from '../components/PageContainer'
import OperatorHbarChart from './OperatorHbarChart/OperatorHbarChart'
import './DashboardPage.scss'

const DashboardPage = () => {
  const data = useGroupBy({
    dateTo: '2023-01-10',
    dateFrom: '2023-01-01',
    groupBy: 'operator_ref',
  }).map((item) => ({
    name: item.operator_ref?.agency_name || 'Unknown',
    total: item.total_planned_rides,
    actual: item.total_actual_rides,
  }))

  return (
    <PageContainer>
      <h2 className="title">מפעילי תח&quot;צ לפי שיעורי יציאת קווים</h2>
      <OperatorHbarChart operators={data} />
    </PageContainer>
  )
}
export default DashboardPage
