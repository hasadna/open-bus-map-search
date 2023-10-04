import React from 'react'
import { TEXTS } from 'src/resources/texts'
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers'
import { DataAndTimeSelectorProps, useValidSelected } from './utils/dateAndTime'

export function TimeSelector({ timeValid, setTimeValid }: DataAndTimeSelectorProps) {
  const [timeSelected, setTimeSelected] = useValidSelected(timeValid, setTimeValid)

  return (
    <TimePicker
      sx={{ width: '100%' }}
      label={TEXTS.choose_time}
      value={timeSelected}
      onChange={(ts) => setTimeSelected(ts)}
      ampm={false}
      viewRenderers={{
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
      }}
    />
  )
}
