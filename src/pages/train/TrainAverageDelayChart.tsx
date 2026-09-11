import { Box, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import type { TrainStationAverageDelay } from './trainData'

const STATION_WIDTH = 180
const CHART_HEIGHT = 300

export function TrainAverageDelayChart({
  averages,
}: Readonly<{ averages: TrainStationAverageDelay[] }>) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const direction = i18n.dir()
  const data = direction === 'rtl' ? [...averages].reverse() : averages
  const chartWidth = Math.max(data.length * STATION_WIDTH, STATION_WIDTH * 2)

  return (
    <Box sx={{ overflowX: 'auto' }} dir={direction}>
      <Box sx={{ width: chartWidth }} dir="ltr">
        <LineChart
          width={chartWidth}
          height={CHART_HEIGHT}
          data={data}
          accessibilityLayer={false}
          margin={{ top: 20, right: 30, bottom: 60, left: 30 }}>
          <XAxis
            dataKey="name"
            interval={0}
            angle={-25}
            textAnchor="end"
            height={70}
            tick={{ fill: theme.palette.text.primary }}
          />
          <YAxis
            tick={{ fill: theme.palette.text.primary }}
            label={{
              value: t('train_average_delay_axis'),
              angle: -90,
              position: 'insideLeft',
              fill: theme.palette.text.primary,
            }}
          />
          <ReferenceLine y={0} stroke={theme.palette.divider} />
          <Tooltip
            formatter={(value) => [
              `${Number(value).toFixed(1)} ${t('train_minutes_short')}`,
              t('train_average_delay'),
            ]}
          />
          <Line
            type="linear"
            dataKey="averageDelayMinutes"
            name={t('train_average_delay')}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </Box>
    </Box>
  )
}
