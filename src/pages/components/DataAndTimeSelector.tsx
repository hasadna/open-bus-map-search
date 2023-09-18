import React, { useEffect, useState } from 'react'
import { INPUT_SIZE } from 'src/resources/sizes'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TEXTS } from 'src/resources/texts'
import moment, { Moment } from 'moment'
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers'

type DataAndTimeSelectorProps = {
  timestamp: moment.Moment
  setTimestamp: (timestamp: moment.Moment) => void
  showTimePicker?: boolean
}

export function DataAndTimeSelector({
  timestamp,
  setTimestamp,
  showTimePicker,
}: DataAndTimeSelectorProps) {
  const [timeSelected, setTimeSelected] = useState<moment.Moment | null>(timestamp)

  useEffect(() => {
    if (timeSelected != null && timeSelected.isValid() && timeSelected.isSameOrBefore(new Date()))
      setTimestamp(timeSelected)
  }, [timeSelected])

  return (
    <>
      <DatePicker
        sx={{ width: INPUT_SIZE }}
        value={timeSelected}
        onChange={(ts) => setTimeSelected(ts)}
        format="DD/MM/YYYY"
        label={TEXTS.choose_datetime}
        disableFuture
      />
      {showTimePicker && (
        <TimePicker
          sx={{ width: INPUT_SIZE }}
          label={TEXTS.choose_datetime}
          value={timeSelected}
          onChange={(ts) => setTimeSelected(ts)}
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
