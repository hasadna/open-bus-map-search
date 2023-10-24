import React from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TEXTS } from 'src/resources/texts'
import { DataAndTimeSelectorProps } from './utils/dateAndTime'
import { DateValidationError } from '@mui/x-date-pickers'
import styled from 'styled-components'

const Error = styled.div`
  color: 'red';
`

export function DateSelector({ time, onChange, customLabel }: DataAndTimeSelectorProps) {
  const [error, setError] = React.useState<DateValidationError | null>(null)
  return (
    <>
      <DatePicker
        sx={{ width: '100%' }}
        value={time}
        onChange={(ts) => onChange(ts!)}
        format="DD/MM/YYYY"
        label={customLabel || TEXTS.choose_date}
        disableFuture
        onError={(err) => setError(err)}
      />
      {error && <Error>{error}</Error>}
    </>
  )
}
