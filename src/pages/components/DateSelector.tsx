import { useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DateValidationError } from '@mui/x-date-pickers'
import { useTranslation } from 'react-i18next'

export type DataSelectorProps = {
  time: moment.Moment
  minDate?: moment.Moment
  customLabel?: string
  disabled?: boolean
  onChange: (timeValid: moment.Moment | null) => void
}

const getErrorMessageKey = (error?: DateValidationError) => {
  switch (error) {
    case 'maxDate':
    case 'minDate':
      return 'bug_date_alert'
    case 'invalidDate':
      return 'bug_date_invalid_format'
  }
}

export function DateSelector({
  time,
  onChange,
  customLabel,
  minDate,
  disabled,
}: DataSelectorProps) {
  const [error, setError] = useState<DateValidationError>()
  const { t } = useTranslation()

  const errorMessageKey = getErrorMessageKey(error)

  return (
    <DatePicker
      value={time}
      onChange={(ts) => onChange(ts)}
      format="DD/MM/YYYY"
      label={customLabel || t('choose_date')}
      disableFuture
      minDate={minDate}
      disabled={disabled}
      onError={(err) => setError(err)}
      slotProps={{
        calendarHeader: {
          sx: {
            '.MuiPickersCalendarHeader-labelContainer': {
              margin: '0',
              marginInlineEnd: 'auto',
            },
          },
        },
        textField: {
          fullWidth: true,
          helperText: errorMessageKey && t(errorMessageKey),
        },
      }}
    />
  )
}
