import { Skeleton } from 'antd'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import LinesHbarChart from './LineHbarChart/LinesHbarChart'
import { useGroupBy } from 'src/api/groupByService'
import { MAJOR_OPERATORS } from 'src/model/operator'
import Widget from 'src/shared/Widget'
import { Dayjs } from 'src/dayjs'

interface WorstLinesChartProps {
  startDate: Dayjs
  endDate: Dayjs
  operatorId?: number
  alertWorstLineHandling: (arg: boolean) => void
}

export const WorstLinesChart = ({
  startDate,
  endDate,
  operatorId,
  alertWorstLineHandling,
}: WorstLinesChartProps) => {
  const [groupByLineData, lineDataLoading] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: 'operator_ref,line_ref',
  })

  const { t } = useTranslation()

  useEffect(() => {
    const totalElements = groupByLineData.length
    const totalZeroElements = groupByLineData.filter((el) => el.totalActualRides === 0).length
    if (totalElements === 0 || totalZeroElements === totalElements) {
      alertWorstLineHandling(true)
    } else {
      alertWorstLineHandling(false)
    }
  }, [groupByLineData])

  return (
    <Widget>
      <h2 className="title">{t('worst_lines_page_title')}</h2>
      {lineDataLoading ? (
        <Skeleton active />
      ) : (
        <LinesHbarChart
          lines={groupByLineData.filter((row) =>
            operatorId
              ? row.operatorRef?.operatorRef === operatorId
              : MAJOR_OPERATORS.includes(row.operatorRef?.operatorRef || -1),
          )}
        />
      )}
    </Widget>
  )
}

export default WorstLinesChart
