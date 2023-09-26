import React from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TEXTS } from 'src/resources/texts'
import { DataAndTimeSelectorProps, useValidSelected } from './utils/dateAndTime'

export function DataSelector({ timeValid, setTimeValid }: DataAndTimeSelectorProps) {
  const [timeSelected, setTimeSelected] = useValidSelected(timeValid, setTimeValid)

  return (
    <DatePicker
      sx={{ width: '100%' }}
      value={timeSelected}
      onChange={(ts) => setTimeSelected(ts)}
      format="DD/MM/YYYY"
      label={TEXTS.choose_date}
      disableFuture
    />
  )
}
