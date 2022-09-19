import { formatted, TEXTS } from 'src/resources/texts'
import React from 'react'
import { BusStop } from 'src/model/busStop'
import SelectWithOptions from 'src/pages/components/SelectWithOptionts'

type StopSelectorProps = {
  stops: BusStop[]
  stopKey: string | undefined
  setStopKey: (stopId: string) => void
}

const StopSelector = ({ stops, stopKey, setStopKey }: StopSelectorProps) => {
  return (
    <SelectWithOptions
      items={stops}
      selected={stopKey}
      setSelected={setStopKey}
      placeholder={formatted(TEXTS.choose_stop, stops.length.toString())}
      getItemKey={(stop) => stop.key}
      getItemDisplay={(stop) => stop.name}
    />
  )
}

export default StopSelector
