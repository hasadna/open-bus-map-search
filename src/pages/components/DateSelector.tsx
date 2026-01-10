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

const startOfTime = dayjs('1-1-2023')

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
      onChange={onChange}
      format="DD/MM/YYYY"
      label={customLabel || t('choose_date')}
      disableFuture
      minDate={minDate || startOfTime}
      disabled={disabled}
      onError={(err) => setError(err)}
      sx={{ width: { xs: '100%', sm: '70%' } }}
      slotProps={{
        calendarHeader: {
          sx: {
            '.MuiPickersCalendarHeader-labelContainer': {
              margin: '0',
            },
          },
        },
        textField: {
          fullWidth: true,
          helperText: errorMessageKey && t(errorMessageKey),
          sx: { bgcolor: '#ffffff', borderRadius: 1 },
        },
      }}
    />
  )
}
