import { renderTimeViewClock, TimePicker } from '@mui/x-date-pickers'
import { useTranslation } from 'react-i18next'
import { atTimeOfDay, formatTimeOfDay, todayIsraelDate } from 'src/dayjs'

type DataAndTimeSelectorProps = {
  // Time-of-day "HH:mm" — the at-rest form. The picker only reads the clock part, so
  // it is anchored to an arbitrary day (today) just to materialize a Dayjs at the border.
  time: string
  onChange: (time: string | null) => void
  customLabel?: string
  minDate?: string
}

export function TimeSelector({ time, onChange, customLabel, minDate }: DataAndTimeSelectorProps) {
  const { t } = useTranslation()
  const anchor = todayIsraelDate()
  return (
    <TimePicker
      sx={{ width: '100%' }}
      label={customLabel || t('choose_time')}
      value={atTimeOfDay(anchor, time)}
      onChange={(ts) => onChange(ts && ts.isValid() ? formatTimeOfDay(ts) : null)}
      minTime={minDate ? atTimeOfDay(anchor, minDate) : undefined}
      ampm={false}
      viewRenderers={{
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
      }}
    />
  )
}
