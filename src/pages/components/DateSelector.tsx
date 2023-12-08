import { useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useTranslation } from 'react-i18next'
import { DataAndTimeSelectorProps } from './utils/dateAndTime'
import { DateValidationError } from '@mui/x-date-pickers'
import styled from 'styled-components'

const Error = styled.div`
  color: 'red';
`

export function DateSelector({ time, onChange, customLabel }: DataAndTimeSelectorProps) {
  const [error, setError] = useState<DateValidationError | null>(null)
  const { t } = useTranslation()

  return (
    <>
      <DatePicker
        sx={{ width: '100%' }}
        value={time}
        onChange={(ts) => onChange(ts!)}
        format="DD/MM/YYYY"
        label={customLabel || t('choose_date')}
        disableFuture
        onError={(err) => setError(err)}
      />
      {error && <Error>{error}</Error>}
    </>
  )
}
