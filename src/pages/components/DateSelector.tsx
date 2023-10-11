import React from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TEXTS } from 'src/resources/texts'
import { DataAndTimeSelectorProps } from './utils/dateAndTime'

export function DateSelector({ time, onChange }: DataAndTimeSelectorProps) {
  return (
    <DatePicker
      sx={{ width: '100%' }}
      value={time}
      onChange={(ts) => onChange(ts!)}
      format="DD/MM/YYYY"
      label={TEXTS.choose_date}
      disableFuture
    />
  )
}
