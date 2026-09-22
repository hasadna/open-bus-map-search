import { useCallback, useState } from 'react'
import { type CivilDate } from 'src/model/time/civilDate'

export function useDate(initialValue: CivilDate) {
  const [date, setDate] = useState<CivilDate>(initialValue)
  const onChange = useCallback((date: CivilDate | null) => {
    if (date) {
      setDate(date)
    }
  }, [])
  return [date, onChange] as const
}
