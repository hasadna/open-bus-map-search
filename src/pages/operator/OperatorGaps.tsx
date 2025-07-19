import { Stack, Typography } from '@mui/material'
import { Skeleton } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart } from 'recharts'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { useGroupBy } from 'src/api/groupByService'
import Widget from 'src/shared/Widget'
import dayjs from 'src/dayjs'

export const OperatorGaps = ({
  operatorId,
  timestamp,
  timeRange = 'day',
}: {
  operatorId?: string
  timestamp?: number
  timeRange?: 'day' | 'week' | 'month' | 'year'
}) => {
  const { t, i18n } = useTranslation()
  const [groupByOperatorData, isLoading] = useGroupBy({
    dateFrom: dayjs(timestamp).add(-1, timeRange),
    dateTo: dayjs(timestamp),
    groupBy: 'operator_ref',
  })

  const data = useMemo(() => {
    const operator = groupByOperatorData?.find((d) => d.operator_ref?.agency_id === operatorId)
    if (!operator) return []

    const missing = operator?.total_planned_rides - operator?.total_actual_rides
    return [
      { name: t('rides_planned'), value: operator?.total_planned_rides },
      { name: t('rides_actual'), value: operator?.total_actual_rides, color: '#00C49F' },
      { name: t('rides_missing'), value: missing, color: '#FF4040' },
      // { name: t('ride_extra'), value: 0, color: '#FFBB28' },
    ]
  }, [operatorId, timestamp, groupByOperatorData, i18n.language])

  const prefersReducedMotion = useMemo(() => {
    return window?.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  return (
    <Widget>
      <Typography
        sx={{
          margin: '17.5px 0 0.5rem ',
          fontWeight: 'bold',
          fontSize: 24,
          lineHeight: '35px',
        }}
        variant="h2">
        {t('operator.statistics')} {t(`operator.time_range.${timeRange}`)}
      </Typography>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : (
        <Stack flexDirection="row" justifyContent="space-between">
          <div>
            <InfoTable>
              {data.map((d) => (
                <InfoItem key={d.name} label={d.name} value={d.value} />
              ))}
            </InfoTable>
          </div>

          <PieChart width={160} height={160}>
            <Pie
              isAnimationActive={!prefersReducedMotion}
              data={data.filter((data) => data?.color)}
              innerRadius={65}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value">
              {data
                .filter((data) => data?.color)
                .map((entry) => (
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
              {calculatePercentage(data[1]?.value, data[2]?.value)}
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
