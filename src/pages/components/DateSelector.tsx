import { DatePicker, DateValidationError } from '@mui/x-date-pickers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'src/dayjs'
import { civilDateToDayjs, EARLIEST_SUPPORTED_DATE } from 'src/model/time/civilDate'

export type DataSelectorProps = {
  time: dayjs.Dayjs
  minDate?: dayjs.Dayjs
  maxDate?: dayjs.Dayjs
  customLabel?: string
  disabled?: boolean
  onChange: (timeValid: dayjs.Dayjs | null) => void
}

const getErrorMessageKey = (error?: DateValidationError) => {
  switch (error) {
    case 'maxDate':
    case 'minDate':
      return 'bug_date_alert'
    case 'disableFuture':
      return 'date_navigator_future_error'
    case 'invalidDate':
      return 'bug_date_invalid_format'
  }
}

const startOfTime = civilDateToDayjs(EARLIEST_SUPPORTED_DATE)

export function DateSelector({
  time,
  onChange,
  customLabel,
  minDate,
  maxDate,
  disabled,
}: DataSelectorProps) {
  const [error, setError] = useState<DateValidationError>()
  // MUI's field shows a typed date only once `value` echoes it back, so every keystroke goes
  // into the draft — even out-of-range ones, which must never reach the caller.
  const [draft, setDraft] = useState<dayjs.Dayjs | null>(time)
  const [committed, setCommitted] = useState(time)
  const { t } = useTranslation()

  if (!time.isSame(committed)) {
    setCommitted(time)
    setDraft(time)
  }

  const errorMessageKey = getErrorMessageKey(error)

  return (
    <DatePicker
      value={draft}
      onChange={(value, context) => {
        setDraft(value)
        if (!context.validationError) onChange(value)
      }}
      format="DD/MM/YYYY"
      label={customLabel || t('choose_date')}
      disableFuture
      minDate={minDate || startOfTime}
      maxDate={maxDate}
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
