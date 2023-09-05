import React from 'react'
import { INPUT_SIZE } from 'src/resources/sizes'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TEXTS } from 'src/resources/texts'
import moment from 'moment'
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers'

type DataAndTimeSelectorProps = {
  timestamp: moment.Moment
  setTimestamp: (timestamp: moment.Moment | null) => void
  showTimePicker?: boolean
}

export function DataAndTimeSelector({
  timestamp,
  setTimestamp,
  showTimePicker,
}: DataAndTimeSelectorProps) {
  return (
    <>
      <DatePicker
        sx={{ width: INPUT_SIZE }}
        value={timestamp}
        onChange={(ts) => setTimestamp(ts)}
        format="DD/MM/YYYY"
        label={TEXTS.choose_datetime}
        disableFuture
      />
      {showTimePicker && (
        <TimePicker
          sx={{ width: INPUT_SIZE }}
          label={TEXTS.choose_datetime}
          value={timestamp}
          onChange={(ts) => setTimestamp(ts)}
          ampm={false}
          viewRenderers={{
            hours: renderTimeViewClock,
            minutes: renderTimeViewClock,
          }}
        />
      )}
    </>
  )
}
