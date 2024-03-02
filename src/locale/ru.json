import { Moment } from 'moment'
import React, { useCallback } from 'react'

export function useDate(initialValue: Moment) {
  const [date, setDate] = React.useState<Moment>(initialValue)
  const onChange = useCallback((date: Moment | null) => {
    if (date) {
      setDate(date)
    }
  }, [])
  return [date, onChange] as const
}
