import React from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TEXTS } from 'src/resources/texts'
import { DataAndTimeSelectorProps } from './utils/dateAndTime'
import { DateValidationError } from '@mui/x-date-pickers'

export function DateSelector({ time, onChange }: DataAndTimeSelectorProps) {
  const [error, setError] = React.useState<DateValidationError | null>(null)
  return (
    <>
      <DatePicker
        sx={{ width: '100%' }}
        value={time}
        onChange={(ts) => onChange(ts!)}
        format="DD/MM/YYYY"
        label={TEXTS.choose_date}
        disableFuture
        onError={(err) => setError(err)}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </>
  )
}
