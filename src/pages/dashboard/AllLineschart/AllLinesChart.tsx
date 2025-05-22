import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from '@mui/material'
import { Skeleton } from 'antd'
import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import OperatorHbarChart from './OperatorHbarChart/OperatorHbarChart'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import Widget from 'src/shared/Widget'
import { Dayjs } from 'src/pages/components/utils/dayjs'

const convertToChartCompatibleStruct = (arr: GroupByRes[]) => {
  return arr.map((item: GroupByRes) => ({
    id: item.operator_ref?.agency_id || 'Unknown',
    name: item.operator_ref?.agency_name || 'Unknown',
    total: item.total_planned_rides,
    actual: item.total_actual_rides,
  }))
}

interface AllChartComponentProps {
  startDate: Dayjs
  endDate: Dayjs
}

export const AllLinesChart: FC<AllChartComponentProps> = ({ startDate, endDate }) => {
  const [groupByOperatorData, groupByOperatorLoading] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: 'operator_ref',
  })
  const { t } = useTranslation()
  return (
    <Widget>
      <h2 className="title">
        {t('dashboard_page_title')}
        <Tooltip
          title={convertLineFeedToHtmlTags(t('dashboard_tooltip_content'))}
          placement="left"
          arrow>
          <InfoCircleOutlined style={{ marginRight: '12px' }} />
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
