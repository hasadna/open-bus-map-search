import { Autocomplete, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

type FilterPositionsByStartTimeSelectorProps = {
  options: {
    value: string
    label: string
  }[]
  startTime?: string
  disabled?: boolean
  setStartTime: (time?: string) => void
}

export function FilterPositionsByStartTimeSelector({
  options,
  startTime,
  disabled,
  setStartTime,
}: FilterPositionsByStartTimeSelectorProps) {
  const normalizedStartTime = startTime?.replace(/-/g, ':')
  const selectedIndex = normalizedStartTime
    ? options.findIndex((option) => option.value.replace(/-/g, ':').startsWith(normalizedStartTime))
    : -1
  const value = selectedIndex >= 0 ? options[selectedIndex] : null

  const { t } = useTranslation()

  return (
    <Autocomplete
      sx={{ width: '100%' }}
      disabled={disabled}
      disablePortal
      value={value}
      onChange={(e, value) => setStartTime(value?.value)}
      id="start-time-select"
      options={options}
      renderInput={(params) => <TextField {...params} label={t('choose_start_time')} />}
      getOptionLabel={(option) => option.label}
    />
  )
}
