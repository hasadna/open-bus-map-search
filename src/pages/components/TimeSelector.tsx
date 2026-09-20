import { renderTimeViewClock, TimePicker } from '@mui/x-date-pickers'
import { useTranslation } from 'react-i18next'
import dayjs from 'src/dayjs'

type DataAndTimeSelectorProps = {
  time: dayjs.Dayjs
  onChange: (timeValid: dayjs.Dayjs | null) => void
  customLabel?: string
  minDate?: dayjs.Dayjs
}

export function TimeSelector({ time, onChange, customLabel, minDate }: DataAndTimeSelectorProps) {
  const { t } = useTranslation()
  return (
    <TimePicker
      sx={{ width: '100%' }}
      label={customLabel || t('choose_time')}
      value={time}
      onChange={(ts) => onChange(ts)}
      minTime={minDate}
      ampm={false}
      viewRenderers={{
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
      }}
    />
  )
}
