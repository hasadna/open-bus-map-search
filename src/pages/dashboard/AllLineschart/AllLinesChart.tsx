import { HelpTwoTone } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import { type CivilDate } from 'src/model/time/civilDate'
import SkeletonLoader from 'src/shared/SkeletonLoader'
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
  startDate: CivilDate
  endDate: CivilDate
}

export const AllLinesChart: FC<AllChartComponentProps> = ({ startDate, endDate }) => {
  const [groupByOperatorData, groupByOperatorLoading] = useGroupBy({
    dateFrom: startDate,
    dateTo: endDate,
    groupBy: 'operator_ref',
  })
  const { t } = useTranslation()

  return (
    <Widget
      title={
        <>
          {t('all_lines_chart_title')}
          <Tooltip
            title={convertLineFeedToHtmlTags(t('dashboard_tooltip_content'))}
            placement="left"
            arrow>
            <HelpTwoTone fontSize="inherit" style={{ marginRight: '12px' }} />
          </Tooltip>
        </>
      }>
      {groupByOperatorLoading ? (
        <SkeletonLoader active />
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
