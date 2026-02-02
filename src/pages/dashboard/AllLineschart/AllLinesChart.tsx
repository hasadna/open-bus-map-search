import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from '@mui/material'
import { Skeleton } from 'antd'
import { FC, Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useWarningContext } from '../context/WarningContextProvider'
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
}

export const AllLinesChart: FC<AllChartComponentProps> = ({ startDate: startDateValue, endDate: endDateValue }) => {
  const [groupByOperatorData, groupByOperatorLoading] = useGroupBy({
    dateFrom: startDateValue.valueOf(),
    dateTo: endDateValue.valueOf(),
    groupBy: 'operator_ref',
  })
  const { t: translate } = useTranslation()

  const { setValue: setWarningFlag } = useWarningContext()

  useEffect(() => {
    const totalElements = groupByOperatorData.length
    const totalZeroElements = groupByOperatorData.filter((el) => el.totalActualRides === 0).length
    if (totalElements === 0 || totalZeroElements === totalElements) {
      setWarningFlag(true)
    } else {
      setWarningFlag(false)
    }
  }, [groupByOperatorData])

  return (
    <Widget
      title={
        <>
          {translate('dashboard_page_title')}
          <Tooltip
            title={convertLineFeedToHtmlTags(translate('dashboard_tooltip_content'))}
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
