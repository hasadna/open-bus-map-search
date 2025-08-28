import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from '@mui/material'
import { Skeleton } from 'antd'
import { FC, Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import { Dayjs } from 'src/dayjs'
import Widget from 'src/shared/Widget'
import OperatorHbarChart from './OperatorHbarChart/OperatorHbarChart'

const convertToChartCompatibleStruct = (arr: GroupByRes[]) => {
  return arr.map((operator) => ({
    id: operator.operatorRef?.operatorRef || 'Unknown',
    name: operator.operatorRef?.agencyName || 'Unknown',
    total: operator.totalPlannedRides,
    actual: operator.totalActualRides,
  }))
}

interface AllChartComponentProps {
  startDate: Dayjs
  endDate: Dayjs
  alertAllChartsZeroLinesHandling: (arg: boolean) => void
}

export const AllLinesChart: FC<AllChartComponentProps> = ({
  startDate,
  endDate,
  alertAllChartsZeroLinesHandling,
}) => {
  const [groupByOperatorData, groupByOperatorLoading] = useGroupBy({
    dateFrom: startDate.valueOf(),
    dateTo: endDate.valueOf(),
    groupBy: 'operator_ref',
  })
  const { t } = useTranslation()

  useEffect(() => {
    const totalElements = groupByOperatorData.length
    const totalZeroElements = groupByOperatorData.filter((el) => el.totalActualRides === 0).length
    if (totalElements === 0 || totalZeroElements === totalElements) {
      alertAllChartsZeroLinesHandling(true)
    } else {
      alertAllChartsZeroLinesHandling(false)
    }
  }, [groupByOperatorData])

  return (
    <Widget
      title={
        <>
          {t('dashboard_page_title')}
          <Tooltip
            title={convertLineFeedToHtmlTags(t('dashboard_tooltip_content'))}
            placement="left"
            arrow>
            <InfoCircleOutlined style={{ marginRight: '12px' }} />
          </Tooltip>
        </>
      }>
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
