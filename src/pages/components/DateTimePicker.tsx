import { Dayjs } from 'dayjs'
import { useCallback, useState } from 'react'

export function useDate(initialValue: Dayjs) {
  const [date, setDate] = useState<Dayjs>(initialValue)
  const onChange = useCallback((date: Dayjs | null) => {
    if (date) {
      setDate(date)
    }
  }, [])
  return [date, onChange] as const
}
