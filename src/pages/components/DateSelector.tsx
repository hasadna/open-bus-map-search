import { useState, useMemo } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useTranslation } from 'react-i18next'
import { DateValidationError } from '@mui/x-date-pickers'
import { DataAndTimeSelectorProps } from './utils/dateAndTime'

export function DateSelector({ time, onChange, customLabel, minDate }: DataAndTimeSelectorProps) {
  const [error, setError] = useState<DateValidationError | null>(null)
  const { t } = useTranslation()

  const errorMessage = useMemo(() => {
    switch (error) {
      case 'maxDate':
      case 'minDate':
        return t('bug_date_alert')
      case 'invalidDate': {
        return t('bug_date_invalid_format')
      }

      default: {
        return ''
      }
    }
  }, [error, t])

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
