import React from 'react'
import { useGroupBy } from 'src/api/groupByService'
import { PageContainer } from '../components/PageContainer'

const DashboardPage = () => {
  const data = useGroupBy({
    dateTo: '2023-01-10',
    dateFrom: '2023-01-01',
    groupBy: 'operator_ref',
  })

  return (
    <PageContainer>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </PageContainer>
  )
}
export default DashboardPage
