import { Autocomplete, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatted } from 'src/locale/utils'
import { BusStop } from 'src/model/busStop'

type StopSelectorProps = {
  disabled?: boolean
  stops: BusStop[]
  stopKey: string | undefined
  setStopKey: (stopId: string) => void
}

const StopSelector = ({ disabled, stops, stopKey, setStopKey }: StopSelectorProps) => {
  const value = stops.find((stop) => stop.key === stopKey) || null
  const { t } = useTranslation()

  return (
    <Autocomplete
      disabled={disabled}
      disablePortal
      value={value}
      onChange={(e, value) => setStopKey(value ? value.key : '')}
      id="stop-select"
      options={stops}
      renderInput={(params) => (
        <TextField {...params} label={formatted(t('choose_stop'), stops.length.toString())} />
      )}
      getOptionLabel={(stop) => stop.name}
      getOptionKey={(stop) => stop.key}
    />
  )
}

export default StopSelector
