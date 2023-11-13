import { TEXTS } from 'src/resources/texts'
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers'
import { DataAndTimeSelectorProps } from './utils/dateAndTime'

export function TimeSelector({ time, onChange }: DataAndTimeSelectorProps) {
  return (
    <TimePicker
      sx={{ width: '100%' }}
      label={TEXTS.choose_time}
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
