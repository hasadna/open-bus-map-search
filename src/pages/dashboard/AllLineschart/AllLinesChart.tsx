import { Tooltip } from '@mui/material'
import { Skeleton } from 'antd'
import { Fragment } from 'react'
import { TEXTS } from 'src/resources/texts'
import OperatorHbarChart from './OperatorHbarChart/OperatorHbarChart'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import { FC } from 'react'
import { Moment } from 'moment/moment'
import Widget from 'src/shared/Widget'

const convertToChartCompatibleStruct = (arr: GroupByRes[]) => {
  return arr.map((item: GroupByRes) => ({
    id: item.operator_ref?.agency_id || 'Unknown',
    name: item.operator_ref?.agency_name || 'Unknown',
    total: item.total_planned_rides,
    actual: item.total_actual_rides,
  }))
}

interface AllChartComponentProps {
  startDate: Moment
  endDate: Moment
}

export const AllLinesChart: FC<AllChartComponentProps> = ({ startDate, endDate }) => {
  const [groupByOperatorData, groupByOperatorLoading] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: 'operator_ref',
  })

  return (
    <Widget>
      <h2 className="title">
        {TEXTS.dashboard_page_title}
        <Tooltip
          title={convertLineFeedToHtmlTags(TEXTS.dashboard_tooltip_content)}
          placement="left"
          arrow>
          <span className="tooltip-icon">i</span>
        </Tooltip>
      </h2>
      {groupByOperatorLoading ? (
        <Skeleton active />
      ) : (
        <OperatorHbarChart operators={convertToChartCompatibleStruct(groupByOperatorData)} />
      )}
    </Widget>
  )
}

function convertLineFeedToHtmlTags(srt: string): React.ReactNode {
  return srt.split('\n').map((row, i) => (
    <Fragment key={i}>
      {row}
      <br />
    </Fragment>
  ))
}

export default AllLinesChart
