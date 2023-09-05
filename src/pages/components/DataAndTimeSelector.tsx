import React from 'react'
import { INPUT_SIZE } from 'src/resources/sizes'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TEXTS } from 'src/resources/texts'
import moment from 'moment'

type DataAndTimeSelectorProps = {
  timestamp: moment.Moment
  setTimestamp: (timestamp: moment.Moment | null) => void
}

export function DataAndTimeSelector({ timestamp, setTimestamp }: DataAndTimeSelectorProps) {
  return (
    <DatePicker
      sx={{ width: INPUT_SIZE }}
      value={timestamp}
      onChange={(ts) => setTimestamp(ts)}
      format="DD/MM/YYYY"
      label={TEXTS.choose_datetime}
      disableFuture
    />
  )
}
