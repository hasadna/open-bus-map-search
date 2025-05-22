import { useCallback, useState } from 'react'
import { Dayjs } from 'src/pages/components/utils/dayjs'

export function useDate(initialValue: Dayjs) {
  const [date, setDate] = useState<Dayjs>(initialValue)
  const onChange = useCallback((date: Dayjs | null) => {
    if (date) {
      setDate(date)
    }
  }, [])
  return [date, onChange] as const
}
