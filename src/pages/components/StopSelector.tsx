import { BusStop } from 'src/model/busStop'
import { Autocomplete, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

type StopSelectorProps = {
  stops: BusStop[]
  stopKey: string | undefined
  setStopKey: (stopId: string) => void
}

const StopSelector = ({ stops, stopKey, setStopKey }: StopSelectorProps) => {
  const valueFinned = stops.find((stop) => stop.key === stopKey)
  const value = valueFinned ? valueFinned : null
  const { t } = useTranslation()
  return (
    <Autocomplete
      disablePortal
      value={value}
      onChange={(e, value) => setStopKey(value ? value.key : '0')}
      id="stop-select"
      options={stops}
      renderInput={(params) => (
        <TextField {...params} label={t('choose_stop').replace('XXX', stops.length.toString())} />
      )}
      getOptionLabel={(stop) => stop.name}
    />
  )
}

export default StopSelector
