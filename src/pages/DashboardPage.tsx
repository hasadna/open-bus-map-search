import React, { useContext } from 'react'
import { PageContainer } from './components/PageContainer'
import { SearchContext } from '../model/pageState'

const DashboardPage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  return <PageContainer>TBD</PageContainer>
}
export default DashboardPage
