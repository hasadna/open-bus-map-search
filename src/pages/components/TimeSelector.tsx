import { useTranslation } from 'react-i18next'
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers'
import { DataAndTimeSelectorProps } from './utils/dateAndTime'

export function TimeSelector({ time, onChange }: DataAndTimeSelectorProps) {
  const { t } = useTranslation()
  return (
    <TimePicker
      sx={{ width: '100%' }}
      label={t('choose_time')}
      value={time}
      onChange={(ts) => onChange(ts!)}
      ampm={false}
      viewRenderers={{
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
      }}
    />
  )
}
