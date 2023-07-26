import React, { useCallback } from 'react'
import { useGroupBy } from 'src/api/groupByService'
import { PageContainer } from '../components/PageContainer'
import Tooltip from '../components/utils/tooltip/Tooltip'
import OperatorHbarChart from './OperatorHbarChart/OperatorHbarChart'
import './DashboardPage.scss'
import { TEXTS } from 'src/resources/texts'
import ArrivalByTimeChart from './ArrivalByTimeChart/ArrivalByTimeChart'
import { DatePicker } from 'antd'
import moment, { Moment } from 'moment'
import LinesHbarChart from './LineHbarChart/LinesHbarChart'

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
  const [groupByHour, setGroupByHour] = React.useState<boolean>(false)

  const groupByOperatorData = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: 'operator_ref',
  }).map((item) => ({
    id: `${item.line_ref}|${item.operator_ref}` || 'Unknown',
    name: item.operator_ref?.agency_name || 'Unknown',
    total: item.total_planned_rides,
    actual: item.total_actual_rides,
  }))
  const groupByLineData = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: 'operator_ref,line_ref',
  }).map((item) => ({
    id: item.operator_ref?.agency_id || 'Unknown',
    operator_name: item.operator_ref?.agency_name || 'Unknown',
    short_name: item.route_short_name,
    long_name: item.route_long_name,
    total: item.total_planned_rides,
    actual: item.total_actual_rides,
  }))

  // const groupByLineData = useGroupBy({
  //   dateTo: endDate,
  //   dateFrom: startDate,
  //   groupBy: 'operator_ref,line_ref',
  // }).map((item) => ({
  //   id: item.operator_ref?.agency_id || 'Unknown',
  //   name: item.operator_ref?.agency_name || 'Unknown',
  //   total: item.total_planned_rides,
  //   actual: item.total_actual_rides,
  // }))

  const graphData = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: groupByHour ? 'operator_ref,gtfs_route_hour' : 'operator_ref,gtfs_route_date',
  }).map((item) => ({
    id: item.operator_ref?.agency_id || 'Unknown',
    name: item.operator_ref?.agency_name || 'Unknown',
    current: item.total_actual_rides,
    max: item.total_planned_rides,
    percent: (item.total_actual_rides / item.total_planned_rides) * 100,
    gtfs_route_date: item.gtfs_route_date,
    gtfs_route_hour: item.gtfs_route_hour,
  }))

  return (
    <PageContainer>
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
        <label className="group-by-hour">
          <input
            type="checkbox"
            checked={groupByHour}
            onChange={(e) => setGroupByHour(e.target.checked)}
          />
          Group by hour
        </label>
      </div>
      <div className="widgets-container">
        <div className="widget">
          <h2 className="title">
            {TEXTS.dashboard_page_title}
            <Tooltip
              text={TEXTS.dashboard_tooltip_content.split('\n').map((row) => (
                <>
                  {row}
                  <br />
                </>
              ))}>
              <span className="tooltip-icon">i</span>
            </Tooltip>
          </h2>
          <OperatorHbarChart operators={groupByOperatorData} />
        </div>
        <div className="widget">
          <h2 className="title">{TEXTS.worst_lines_page_title}</h2>
          <LinesHbarChart lines={groupByLineData} operators_whitelist={['אלקטרה אפיקים']} />
        </div>
        <div className="widget">
          <h2 className="title">{TEXTS.dashboard_page_graph_title}</h2>
          <ArrivalByTimeChart data={graphData} />
        </div>
      </div>
    </PageContainer>
  )
}
export default DashboardPage
