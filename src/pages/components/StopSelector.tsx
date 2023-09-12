import { formatted, TEXTS } from 'src/resources/texts'
import React from 'react'
import { BusStop } from 'src/model/busStop'
import { Autocomplete, TextField } from '@mui/material'
import { INPUT_SIZE } from 'src/resources/sizes'

type StopSelectorProps = {
  stops: BusStop[]
  stopKey: string | undefined
  setStopKey: (stopId: string) => void
}

const StopSelector = ({ stops, stopKey, setStopKey }: StopSelectorProps) => {
  const valueFinned = stops.find((stop) => stop.key === stopKey)
  const value = valueFinned ? valueFinned : null

  return (
    <Autocomplete
      disablePortal
      value={value}
      onChange={(e, value) => setStopKey(value ? value.key : '0')}
      id="stop-select"
      sx={{ width: INPUT_SIZE * 2 }}
      options={stops}
      renderInput={(params) => (
        <TextField {...params} label={formatted(TEXTS.choose_stop, stops.length.toString())} />
      )}
      getOptionLabel={(stop) => stop.name}
    />
  )
}

export default StopSelector
