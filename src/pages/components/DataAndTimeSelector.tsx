import React, { useEffect, useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TEXTS } from 'src/resources/texts'
import moment, { Moment } from 'moment'
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers'

type DataAndTimeSelectorProps = {
  timeValid: moment.Moment
  setTimeValid: (timeValid: moment.Moment) => void
  showTimePicker?: boolean
}

/**
 * @param timeSelected - what the user select. can be invalid.
 * @param timestamp - valid time that the user choose. must be valid.
 */
export function DataAndTimeSelector({
  timeValid,
  setTimeValid,
  showTimePicker,
}: DataAndTimeSelectorProps) {
  const [timeSelected, setTimeSelected] = useState<moment.Moment | null>(timeValid)

  useEffect(() => {
    if (timeSelected != null && timeSelected.isValid() && timeSelected.isSameOrBefore(new Date()))
      setTimeValid(timeSelected)
  }, [timeSelected])

  useEffect(() => {
    if (timeSelected != null && !timeSelected.isSame(timeValid)) setTimeSelected(timeValid)
  }, [timeValid])

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
