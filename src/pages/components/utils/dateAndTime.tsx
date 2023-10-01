import moment, { Moment } from 'moment'
import { useEffect, useState } from 'react'

export type DataAndTimeSelectorProps = {
  timeValid: moment.Moment
  setTimeValid: (timeValid: moment.Moment) => void
}

type stateType = moment.Moment | null

/**
 * @param timeSelected - what the user select. can be invalid.
 * @param timeValid - valid time that the user choose. must be valid.
 */
export function useValidSelected(
  timeValid: DataAndTimeSelectorProps['timeValid'],
  setTimeValid: DataAndTimeSelectorProps['setTimeValid'],
): [stateType, React.Dispatch<stateType>] {
  const [timeSelected, setTimeSelected] = useState<stateType>(timeValid)

  useEffect(() => {
    if (timeSelected != null && timeSelected.isValid() && timeSelected.isSameOrBefore(new Date()))
      setTimeValid(timeSelected)
  }, [timeSelected])

  useEffect(() => {
    if (timeSelected != null && !timeSelected.isSame(timeValid)) setTimeSelected(timeValid)
  }, [timeValid])

  return [timeSelected, setTimeSelected]
}
