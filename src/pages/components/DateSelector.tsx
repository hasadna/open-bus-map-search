import { DatePicker, DateValidationError } from '@mui/x-date-pickers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatIsraelDate, parseIsraelDate } from 'src/dayjs'

export type DataSelectorProps = {
  // Civil date "YYYY-MM-DD" — the at-rest form. The Dayjs the MUI picker needs is
  // materialized here (at the border) and never leaves this component.
  time: string
  minDate?: string
  customLabel?: string
  disabled?: boolean
  onChange: (date: string | null) => void
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

const START_OF_TIME = '2023-01-01'

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
      value={parseIsraelDate(time)}
      onChange={(value) => onChange(value && value.isValid() ? formatIsraelDate(value) : null)}
      format="DD/MM/YYYY"
      label={customLabel || t('choose_date')}
      disableFuture
      minDate={parseIsraelDate(minDate ?? START_OF_TIME)}
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
