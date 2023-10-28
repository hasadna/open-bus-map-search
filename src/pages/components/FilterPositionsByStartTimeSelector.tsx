import React from 'react'
import { TEXTS } from 'src/resources/texts'
import { Autocomplete, TextField } from '@mui/material'

type FilterPositionsByStartTimeSelectorProps = {
  options: {
    value: string
    label: string
  }[]
  startTime?: string
  setStartTime: (time: string) => void
}

export function FilterPositionsByStartTimeSelector({
  options,
  startTime,
  setStartTime,
}: FilterPositionsByStartTimeSelectorProps) {
  const valueFinned = options.find((option) => option.value === startTime)
  const value = valueFinned ? valueFinned : null

  return (
    <Autocomplete
      sx={{ width: '100%' }}
      disablePortal
      value={value}
      onChange={(e, value) => setStartTime(value ? value.value : '0')}
      id="start-time-select"
      options={options}
      renderInput={(params) => <TextField {...params} label={TEXTS.choose_start_time} />}
      getOptionLabel={(option) => option.label}
    />
  )
}
