import { useMemo } from 'react'
import { Stack, Typography } from '@mui/material'
import { PieChart, Pie, Cell } from 'recharts'
import { useTranslation } from 'react-i18next'
import { Skeleton } from 'antd'
import moment from 'moment'
import { InfoItem, InfoTable } from '../components/InfoTable'
import Widget from 'src/shared/Widget'
import { useGroupBy } from 'src/api/groupByService'

export const OperatorGaps = ({
  operatorId,
  timestamp,
}: {
  operatorId?: string
  timestamp?: number
}) => {
  const { t, i18n } = useTranslation()
  const [groupByOperatorData, isLoading] = useGroupBy({
    dateFrom: moment(timestamp).add(-1, 'day').endOf('day'),
    dateTo: moment(timestamp).endOf('day'),
    groupBy: 'operator_ref',
  })

  const data = useMemo(() => {
    const operator = groupByOperatorData?.find((d) => d.operator_ref?.agency_id === operatorId)

    return [
      { name: t('ride_as_planned'), value: operator?.total_planned_rides, color: '#00C49F' },
      { name: t('ride_extra'), value: 2000, color: '#FFBB28' },
      { name: t('ride_missing'), value: operator?.total_routes, color: '#FF4040' },
    ]
  }, [operatorId, timestamp, groupByOperatorData, i18n.language])

  return (
    <Widget>
      <Typography variant="h5">{t('operator.statistics')}</Typography>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <Stack flexDirection="row" justifyContent="space-between">
          <div>
            <InfoTable>
              {data.map((d) => (
                <InfoItem key={d.name} lable={d.name} value={d.value} />
              ))}
            </InfoTable>
          </div>
          <PieChart width={160} height={160}>
            <Pie data={data} innerRadius={65} outerRadius={80} paddingAngle={5} dataKey="value">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              fontSize="32"
              fontWeight={500}>
              {calculatePercentage(data[0].value, data[2].value, data[1].value)}
            </text>
          </PieChart>
        </Stack>
      )}
    </Widget>
  )
}

const calculatePercentage = (
  planned: number | undefined = 0,
  missing: number | undefined = 0,
  extra: number | undefined = 0,
) => {
  const total = planned + missing + extra
  if (total === 0) return ''
  const percentage = ((planned + extra) / total) * 100
  return `${percentage.toFixed(1)}%`
}
