import { Autocomplete, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatted } from 'src/locale/utils'
import { BusStop } from 'src/model/busStop'

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
        <TextField {...params} label={formatted(t('choose_stop'), stops.length.toString())} />
      )}
      getOptionLabel={(stop) => stop.name}
    />
  )
}

export default StopSelector
