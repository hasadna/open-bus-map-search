import { Box, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Line, LineChart, XAxis, YAxis } from 'recharts'
import { toIsraelTimezone } from 'src/dayjs'
import { getTrainStationTimings, type TrainRideData } from './trainData'

const STATION_WIDTH = 180
const TIMELINE_HEIGHT = 180

type StationChartPoint = {
  chartIndex: number
  position: number
  name: string
  time: string
  color: string
  direction: 'ltr' | 'rtl'
}

function StationDot({
  cx = 0,
  cy = 0,
  payload,
}: {
  cx?: number
  cy?: number
  payload?: StationChartPoint
}) {
  if (!payload) return null

  return (
    <g>
      <text fill={payload.color} textAnchor="middle" direction={payload.direction}>
        <tspan x={cx} y={cy - 38}>
          {payload.name}
        </tspan>
        <tspan x={cx} y={cy - 18}>
          {payload.time}
        </tspan>
      </text>
      <circle cx={cx} cy={cy} r={7} fill={payload.color} stroke={payload.color} />
    </g>
  )
}

export function TrainRideTimeline({ ride }: { ride: TrainRideData }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const direction = i18n.dir()
  const points = getTrainStationTimings(ride.stops, ride.locations).map((station) => {
    const color =
      station.status === 'out-of-range'
        ? theme.palette.error.main
        : station.status === 'no-data'
          ? theme.palette.text.disabled
          : theme.palette.text.primary
    const plannedTime = station.plannedTime
      ? toIsraelTimezone(station.plannedTime).format('HH:mm')
      : '-'
    const delay = station.delayMinutes
    const delayText =
      delay === undefined
        ? ''
        : ` (${delay >= 0 ? '+' : ''}${delay.toFixed(1)} ${t('train_minutes_short')})`

    return {
      chartIndex: 0,
      position: 1,
      name: station.name ?? '-',
      time: `${plannedTime}${delayText}`,
      color,
      direction,
    }
  })
  const displayPoints = (direction === 'rtl' ? [...points].reverse() : points).map(
    (point, chartIndex) => ({ ...point, chartIndex }),
  )

  if (displayPoints.length === 0) return null
  const chartWidth = Math.max(displayPoints.length * STATION_WIDTH, STATION_WIDTH * 2)

  return (
    <Box sx={{ overflowX: 'auto' }} dir={direction}>
      <Box sx={{ width: chartWidth }} dir="ltr">
        <LineChart
          width={chartWidth}
          height={TIMELINE_HEIGHT}
          data={displayPoints}
          accessibilityLayer={false}
          margin={{ top: 70, right: STATION_WIDTH / 2, bottom: 20, left: STATION_WIDTH / 2 }}>
          <XAxis dataKey="chartIndex" hide />
          <YAxis hide domain={[0, 2]} />
          <Line
            type="linear"
            dataKey="position"
            stroke={theme.palette.divider}
            strokeWidth={3}
            isAnimationActive={false}
            activeDot={false}
            dot={<StationDot />}
          />
        </LineChart>
      </Box>
    </Box>
  )
}
