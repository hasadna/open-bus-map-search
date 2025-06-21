import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from '@mui/material'
import { Skeleton } from 'antd'
import { FC, Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import OperatorHbarChart from './OperatorHbarChart/OperatorHbarChart'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import Widget from 'src/shared/Widget'
import { Dayjs } from 'src/dayjs'

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
  alertAllChartsZeroLinesHandling: ((arg: boolean) => void)
}

export const AllLinesChart: FC<AllChartComponentProps> = ({ startDate, endDate, alertAllChartsZeroLinesHandling }) => {
  const [groupByOperatorData, groupByOperatorLoading] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: 'operator_ref',
  })
  const { t } = useTranslation()

  useEffect(() => {
    const totalElements = groupByOperatorData.length;
    const totalZeroElements = groupByOperatorData.filter(el => el.total_actual_rides === 0).length;
    if (totalElements === 0 || totalZeroElements === totalElements) {
      alertAllChartsZeroLinesHandling(true)
    } else {
      alertAllChartsZeroLinesHandling(false)
    }
  }, [groupByOperatorData])

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
