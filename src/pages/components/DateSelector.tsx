import { useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { t } from 'i18next'
import { DateValidationError } from '@mui/x-date-pickers'
import { DataAndTimeSelectorProps } from './utils/dateAndTime'

type errorMessageTypes = '' | 'bug_date_alert' | 'bug_date_invalid_format'
const getErrorMessage = (error: DateValidationError): errorMessageTypes => {
  let message: errorMessageTypes = ''
  switch (error) {
    case 'maxDate':
    case 'minDate':
      message = t('bug_date_alert')
      break
    case 'invalidDate': {
      message = t('bug_date_invalid_format')
      break
    }

    default: {
      message = ''
    }
  }
  return message
}

export function DateSelector({ time, onChange, customLabel, minDate }: DataAndTimeSelectorProps) {
  const [error, setError] = useState<DateValidationError | null>(null)

  const errorMessage = getErrorMessage(error)

  return (
    <DatePicker
      sx={{ width: '100%' }}
      value={time}
      onChange={(ts) => onChange(ts!)}
      format="DD/MM/YYYY"
      label={customLabel || t('choose_date')}
      disableFuture
      minDate={minDate}
      onError={(err) => setError(err)}
      slotProps={{
        textField: {
          helperText: errorMessage,
        },
      }}
    />
  )
}
