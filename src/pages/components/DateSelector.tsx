import { useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DateValidationError } from '@mui/x-date-pickers'
import { useTranslation } from 'react-i18next'
import { DataAndTimeSelectorProps } from './utils/dateAndTime'

const getErrorMessageKey = (error?: DateValidationError) => {
  switch (error) {
    case 'maxDate':
    case 'minDate':
      return 'bug_date_alert'
    case 'invalidDate':
      return 'bug_date_invalid_format'
  }
}

export function DateSelector({ time, onChange, customLabel, minDate }: DataAndTimeSelectorProps) {
  const [error, setError] = useState<DateValidationError>()
  const { t } = useTranslation()

  const errorMessageKey = getErrorMessageKey(error)

  return (
    <DatePicker
      sx={{ width: '100%' }}
      value={time}
      onChange={(ts) => onChange(ts)}
      format="DD/MM/YYYY"
      label={customLabel || t('choose_date')}
      disableFuture
      minDate={minDate}
      onError={(err) => setError(err)}
      slotProps={{
        textField: {
          helperText: errorMessageKey && t(errorMessageKey),
        },
      }}
    />
  )
}
