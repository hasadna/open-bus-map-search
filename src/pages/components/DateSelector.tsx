import { DatePicker, DateValidationError } from '@mui/x-date-pickers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'src/dayjs'

export type DataSelectorProps = {
  time: dayjs.Dayjs
  minDate?: dayjs.Dayjs
  customLabel?: string
  disabled?: boolean
  onChange: (timeValid: dayjs.Dayjs | null) => void
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
