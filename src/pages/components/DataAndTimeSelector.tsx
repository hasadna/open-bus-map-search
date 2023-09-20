import React, { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (timeSelected != null && !timeSelected.isSame(timestamp)) setTimeSelected(timestamp)
  }, [timestamp])

  const width = showTimePicker ? '50%' : '100%'

  return (
    <>
      <DatePicker
        sx={{ width }}
        value={timeSelected}
        onChange={(ts) => setTimeSelected(ts)}
        format="DD/MM/YYYY"
        label={TEXTS.choose_date}
        disableFuture
      />
      {showTimePicker && (
        <TimePicker
          sx={{ width }}
          label={TEXTS.choose_time}
          value={timeSelected}
          onChange={(ts) => setTimeSelected(ts)}
          ampm={false}
          viewRenderers={{
            hours: renderTimeViewClock,
            minutes: renderTimeViewClock,
          }}
          disableFuture
        />
      )}
    </>
  )
}
